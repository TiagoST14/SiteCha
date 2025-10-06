using DotNetEnv;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
Env.Load();
var connectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
var databaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE");

builder.Services.AddSingleton<IMongoClient>(new MongoClient(connectionString));
builder.Services.AddScoped(sp => 
    sp.GetRequiredService<IMongoClient>().GetDatabase(databaseName)
);
{
    var database = sp.GetRequiredService<IMongoDatabase>();
});
var app = builder.Build();
app.UseCors("AllowAll");

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();


{
        .FirstOrDefaultAsync();
    

});

app.Run();

{
    [BsonId]
    public int Id { get; set; }
    public string? Nome { get; set; }
}
