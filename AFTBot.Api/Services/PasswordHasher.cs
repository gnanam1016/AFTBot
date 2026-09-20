using System.Security.Cryptography;
using AFTBot.Api.Interfaces;

namespace AFTBot.Api.Services;

public class PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16; // 128-bit salt
    private const int HashSize = 32; // 256-bit subkey
    private const int Iterations = 100000;
    private static readonly HashAlgorithmName Algorithm = HashAlgorithmName.SHA256;

    public (string Hash, string Salt) HashPassword(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        var saltBytes = RandomNumberGenerator.GetBytes(SaltSize);
        var hashBytes = Rfc2898DeriveBytes.Pbkdf2(
            password,
            saltBytes,
            Iterations,
            Algorithm,
            HashSize
        );

        return (Convert.ToBase64String(hashBytes), Convert.ToBase64String(saltBytes));
    }

    public bool VerifyPassword(string password, string storedHash, string storedSalt)
    {
        if (string.IsNullOrWhiteSpace(password) || 
            string.IsNullOrWhiteSpace(storedHash) || 
            string.IsNullOrWhiteSpace(storedSalt))
        {
            return false;
        }

        try
        {
            var saltBytes = Convert.FromBase64String(storedSalt);
            var expectedHashBytes = Convert.FromBase64String(storedHash);

            var computedHashBytes = Rfc2898DeriveBytes.Pbkdf2(
                password,
                saltBytes,
                Iterations,
                Algorithm,
                expectedHashBytes.Length
            );

            return CryptographicOperations.FixedTimeEquals(computedHashBytes, expectedHashBytes);
        }
        catch
        {
            return false;
        }
    }
}
