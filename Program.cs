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

builder.Services.AddScoped<IMongoCollection<Presente>>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    return database.GetCollection<Presente>("presentes");
});


builder.Services.AddScoped<IMongoCollection<Escolha>>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    return database.GetCollection<Escolha>("escolhas");
});
var app = builder.Build();
app.UseCors("AllowAll");

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();


app.MapPost("/presentes", async (List<Presente> novosPresentes, IMongoCollection<Presente> presentesCollection) =>
{
    // 1. Pega o último ID do banco para saber onde começar a contagem.
    var ultimoPresente = await presentesCollection.Find(_ => true)
        .SortByDescending(p => p.Id)
        .FirstOrDefaultAsync();
    
    var proximoId = (ultimoPresente?.Id ?? 0) + 1;

    
    foreach (var presente in novosPresentes)
    {
        
        presente.Id = proximoId;
        
        presente.Disponivel = true;
        
        proximoId++;
    }
    
    
    await presentesCollection.InsertManyAsync(novosPresentes);
    
    
    return Results.Ok($"{novosPresentes.Count} presentes adicionados com sucesso.");
});

app.MapGet("/presentesDisponiveis", async (IMongoCollection<Presente> presentesCollection) =>
{
    
    var presentesDisponiveis = await presentesCollection.Find(p => p.Disponivel == true).ToListAsync();
    return Results.Ok(presentesDisponiveis);
});

app.MapGet("/presentes/sincronizar", async (IMongoCollection<Presente> presentesCollection, IMongoCollection<Escolha> escolhasCollection) =>
{
    // 1. Encontra todos os presentes que estão marcados como indisponíveis.
    var presentesIndisponiveis = await presentesCollection.Find(p => p.Disponivel == false).ToListAsync();
    
    int presentesCorrigidos = 0;

    // 2. Passa por cada presente indisponível para verificar seu status.
    foreach (var presente in presentesIndisponiveis)
    {
        // 3. Verifica se existe alguma escolha registrada para este presente.
        var existeEscolha = await escolhasCollection.Find(e => e.PresenteNome == presente.Nome).AnyAsync();

        // 4. Se NÃO existe uma escolha, significa que ela foi apagada manualmente.
        if (!existeEscolha)
        {
            // 5. Corrige o status do presente, tornando-o disponível novamente.
            var filter = Builders<Presente>.Filter.Eq(p => p.Id, presente.Id);
            var update = Builders<Presente>.Update.Set(p => p.Disponivel, true);
            await presentesCollection.UpdateOneAsync(filter, update);
            presentesCorrigidos++;
        }
    }

    return Results.Ok($"{presentesCorrigidos} presentes foram sincronizados e estão disponíveis novamente.");
});


app.MapPost("/registrarEscolha", async (Escolha novaEscolha, IMongoCollection<Presente> presentesCollection, IMongoCollection<Escolha> escolhasCollection) =>
{
    // 1. Define o filtro para encontrar o presente pelo ID que veio na escolha
    var filter = Builders<Presente>.Filter.Eq(p => p.Nome, novaEscolha.PresenteNome);

    // 2. Define a atualização para marcar o presente como não disponível
    var update = Builders<Presente>.Update.Set(p => p.Disponivel, false);

    // 3. Executa a atualização na coleção de presentes
    var result = await presentesCollection.UpdateOneAsync(filter, update);

    // Se o presente não foi encontrado ou já estava escolhido, retorna erro
    if (result.ModifiedCount == 0)
    {
        return Results.NotFound("O presente não foi encontrado ou já foi escolhido.");
    }

    // 4. Se a atualização deu certo, salva o "recibo" na coleção de escolhas
    await escolhasCollection.InsertOneAsync(novaEscolha);
    
    return Results.Ok(novaEscolha);
});


app.Run();

public class Presente
{
    [BsonId]
    public int Id { get; set; }
    public string? Nome { get; set; }
    public bool Disponivel { get; set; }
}


public class Escolha
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string PresenteNome { get; set; } 
    public string NomePessoa { get; set; }
    public string TelefonePessoa { get; set; }
}
