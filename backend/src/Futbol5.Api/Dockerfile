FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/Futbol5.Domain/Futbol5.Domain.csproj", "Futbol5.Domain/"]
COPY ["src/Futbol5.Application/Futbol5.Application.csproj", "Futbol5.Application/"]
COPY ["src/Futbol5.Infrastructure/Futbol5.Infrastructure.csproj", "Futbol5.Infrastructure/"]
COPY ["src/Futbol5.Api/Futbol5.Api.csproj", "Futbol5.Api/"]
RUN dotnet restore "Futbol5.Api/Futbol5.Api.csproj"

COPY src/ .
WORKDIR /src/Futbol5.Api
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Futbol5.Api.dll"]