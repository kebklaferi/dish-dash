# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["CatalogService/CatalogService.csproj", "CatalogService/"]
RUN dotnet restore "CatalogService/CatalogService.csproj"

COPY . .
WORKDIR "/src/CatalogService"
RUN dotnet build "./CatalogService.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./CatalogService.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Runtime stage (uporabimo SDK kot runtime)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS final
WORKDIR /app

COPY --from=publish /app/publish .


EXPOSE 8080
ENTRYPOINT ["dotnet", "CatalogService.dll"]