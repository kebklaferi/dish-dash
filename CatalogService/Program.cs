using CatalogService;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<CatalogDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("CatalogDb"),
        npsql => npsql.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null
        )));

builder.Services.AddControllers();
builder.Services.AddHostedService<Worker>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{ 
    app.UseSwagger(c =>
    {
        c.RouteTemplate = "api/catalog/swagger/{documentName}/swagger.json";
    });
    
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/api/catalog/swagger/v1/swagger.json", "Catalog API V1");
        c.RoutePrefix = "api/catalog/swagger";
    });
}

app.MapControllers();
app.MapGet("/api/catalog/health", () => Results.Ok(new { status = "Healthy" }))
   .WithName("GetHealth");

app.Run();
