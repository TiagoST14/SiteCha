
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

# Copia o arquivo .csproj e restaura as dependências primeiro
# ATENÇÃO: Troque "SeuProjeto.csproj" pelo nome real do seu arquivo .csproj
COPY *.csproj .
RUN dotnet restore "./projetoDotnet.csproj"

# Copia o resto do código-fonte e publica o aplicativo
COPY . .
# ATENÇÃO: Troque "SeuProjeto.csproj" novamente aqui
RUN dotnet publish "./projetoDotnet.csproj" -c Release -o /app/publish --no-restore

# ===============================================================
# Estágio 2: Imagem Final (Runtime)
# Aqui usamos uma imagem muito menor, apenas com o necessário para RODAR
# o aplicativo, tornando-o mais leve e seguro.
# ===============================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expõe a porta 80. O Render vai se conectar ao seu app através dela.
EXPOSE 80

# Comando para iniciar o servidor quando o container for ligado
# ATENÇÃO: Troque "SeuProjeto.dll" pelo nome real do arquivo .dll do seu projeto
ENTRYPOINT ["dotnet", "projetoDotnet.dll"]