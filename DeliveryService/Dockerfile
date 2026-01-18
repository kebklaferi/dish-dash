# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["DeliveryService/DeliveryService.csproj", "DeliveryService/"]
RUN dotnet restore "DeliveryService/DeliveryService.csproj"
COPY . .
WORKDIR "/src/DeliveryService"
RUN dotnet build "./DeliveryService.csproj" -c $BUILD_CONFIGURATION -o /app/build /p:RunNSwag=false
RUN dotnet publish "./DeliveryService.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false /p:RunNSwag=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8090
ENTRYPOINT ["dotnet", "DeliveryService.dll"]