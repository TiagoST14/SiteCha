using DotNetEnv;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

var builder = WebApplication.CreateBuilder(args);

// ADICIONE ISSO:
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
builder.Services.AddScoped<IMongoCollection<Dados>>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    return database.GetCollection<Dados>("dados");
});
var app = builder.Build();
app.UseCors("AllowAll");

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

// Suas rotas permanecem iguais
app.MapGet("/resultado", async (IMongoCollection<Dados> dadosCollection ) =>
{
    var dados = await dadosCollection.Find(_ => true).ToListAsync();
    return Results.Ok(dados);
});

app.MapPost("/cadastrarItem", async (Dados novoDados, IMongoCollection<Dados> dadosCollection) => 
{
    // Encontrar o maior ID atual e incrementar
    var ultimoDado = await dadosCollection.Find(_ => true)
        .SortByDescending(d => d.Id)
        .FirstOrDefaultAsync();
    
    novoDados.Id = (ultimoDado?.Id ?? 0) + 1;
    
    await dadosCollection.InsertOneAsync(novoDados);
    return Results.Created($"/cadastrarItem/{novoDados.Id}", novoDados);
});

app.Run();

public class Dados
{
    [BsonId]
    [BsonRepresentation(BsonType.Int32)]
    public int Id { get; set; }
    public string? Nome { get; set; }
    public string? Telefone { get; set; }
    public string? Item { get; set; }
}
