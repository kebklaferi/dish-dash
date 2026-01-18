using CatalogService;
using CatalogService.Logging;
using CatalogService.Middleware;
using CatalogService.MockData;
using CatalogService.RabbitMQ;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddHostedService<Worker>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<RabbitMqService>();
builder.Services.AddScoped<CorrelationLogger>();

builder.Services.AddDbContext<CatalogDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("CatalogDb"),
        npsql => npsql.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null
        )));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();
    await db.Database.EnsureDeletedAsync();
    await db.Database.EnsureCreatedAsync();
    await DataSeeder.SeedAsync(db);
}
app.UseSwagger(c =>
{
    c.RouteTemplate = "api/catalog/swagger/{documentName}/swagger.json";
});
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/api/catalog/swagger/v1/swagger.json", "Catalog API V1");
    c.RoutePrefix = "api/catalog/swagger";
});

app.UseMiddleware<CorrelationIdMiddleware>();
app.MapControllers();
app.MapGet("/api/catalog/health", () => Results.Ok(new { status = "Healthy" }))
   .WithName("GetHealth");

app.Run();
