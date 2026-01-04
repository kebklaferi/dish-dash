using DeliveryService;
using DeliveryService.Client;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddHostedService<Worker>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<DeliveryDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DeliveryDatabase"),
        npsql => npsql.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null
        )));
builder.Services.AddHttpClient<NotificationClient>(client =>
{
    var notificationServiceUrl = builder.Configuration["NotificationService:BaseUrl"] 
                                 ?? "http://notificationservice:3004";
    client.BaseAddress = new Uri(notificationServiceUrl);
    client.Timeout = TimeSpan.FromSeconds(10);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DeliveryDbContext>();
    db.Database.Migrate();
}

app.UseSwagger(c =>
{
    c.RouteTemplate = "api/delivery/swagger/{documentName}/swagger.json";
});

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/api/delivery/swagger/v1/swagger.json", "Delivery Service API V1");
    c.RoutePrefix = "api/delivery/swagger";
});

app.MapControllers();
app.MapGet("/api/delivery/health", () => Results.Ok(new { status = "Healthy" }))
   .WithName("GetHealth");

app.Run();
