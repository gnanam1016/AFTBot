using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using AFTBot.Api.Configuration;
using AFTBot.Api.Interfaces;
using Microsoft.Extensions.Options;

namespace AFTBot.Api.Services;

public class TokenService : ITokenService
{
    private readonly JwtOptions _options;
    private readonly byte[] _key;

    public TokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
        _key = Encoding.UTF8.GetBytes(_options.SecretKey);
    }

    public string GenerateToken(string username, string displayName, string role = "Admin")
    {
        var now = DateTimeOffset.UtcNow;
        var exp = now.AddHours(_options.TokenExpiryHours);

        var header = new { alg = "HS256", typ = "JWT" };
        var payload = new
        {
            sub = username,
            name = displayName,
            role = role,
            iss = _options.Issuer,
            iat = now.ToUnixTimeSeconds(),
            exp = exp.ToUnixTimeSeconds()
        };

        var headerBase64 = Base64UrlEncode(JsonSerializer.SerializeToUtf8Bytes(header));
        var payloadBase64 = Base64UrlEncode(JsonSerializer.SerializeToUtf8Bytes(payload));
        var rawData = $"{headerBase64}.{payloadBase64}";

        using var hmac = new HMACSHA256(_key);
        var signature = Base64UrlEncode(hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData)));

        return $"{rawData}.{signature}";
    }

    public bool ValidateToken(string token, out string? username, out string? displayName)
    {
        username = null;
        displayName = null;

        if (string.IsNullOrWhiteSpace(token)) return false;

        var parts = token.Split('.');
        if (parts.Length != 3) return false;

        var headerBase64 = parts[0];
        var payloadBase64 = parts[1];
        var signatureBase64 = parts[2];

        var rawData = $"{headerBase64}.{payloadBase64}";

        using var hmac = new HMACSHA256(_key);
        var expectedSig = Base64UrlEncode(hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData)));

        if (!CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(signatureBase64),
            Encoding.UTF8.GetBytes(expectedSig)))
        {
            return false;
        }

        try
        {
            var payloadBytes = Base64UrlDecode(payloadBase64);
            using var doc = JsonDocument.Parse(payloadBytes);
            var root = doc.RootElement;

            if (root.TryGetProperty("exp", out var expProp))
            {
                var expSeconds = expProp.GetInt64();
                var nowSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                if (nowSeconds > expSeconds)
                {
                    return false; // Expired
                }
            }

            if (root.TryGetProperty("sub", out var subProp))
            {
                username = subProp.GetString();
            }

            if (root.TryGetProperty("name", out var nameProp))
            {
                displayName = nameProp.GetString();
            }

            return true;
        }
        catch
        {
            return false;
        }
    }

    private static string Base64UrlEncode(byte[] input)
    {
        return Convert.ToBase64String(input)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static byte[] Base64UrlDecode(string input)
    {
        var output = input.Replace('-', '+').Replace('_', '/');
        switch (output.Length % 4)
        {
            case 2: output += "=="; break;
            case 3: output += "="; break;
        }
        return Convert.FromBase64String(output);
    }
}
