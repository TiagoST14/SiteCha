# ===============================================================
# Estágio 1: Compilação (Build) com .NET 9
# ===============================================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /source

# Passo 1: Copia TODOS os arquivos do projeto para dentro do container
COPY . .

# Passo 2: Restaura as dependências
RUN dotnet restore "./projetoDotnet.csproj"

# Passo 3: Publica o aplicativo
RUN dotnet publish "./projetoDotnet.csproj" -c Release -o /app/publish --no-restore

# ===============================================================
# Estágio 2: Imagem Final (Runtime) com .NET 9
# ===============================================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 80

# ATENÇÃO: Verifique se "projetoDotnet.dll" é o nome correto do seu arquivo .dll
ENTRYPOINT ["dotnet", "projetoDotnet.dll"]