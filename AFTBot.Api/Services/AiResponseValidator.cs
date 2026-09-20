using System.Net.Mail;
using System.Text.RegularExpressions;
using AFTBot.Api.DTOs.Ai;

namespace AFTBot.Api.Services;

public interface IAiResponseValidator
{
    bool TryValidateAndSanitize(AiChatResponse response, out string? errorMessage);
}

public class AiResponseValidator : IAiResponseValidator
{
    private static readonly HashSet<string> AllowedPurposes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Software / Product Enquiry",
        "Training",
        "Internship",
        "Software Development",
        "AI / IoT Solutions",
        "School / College Solutions",
        "Other"
    };

    public bool TryValidateAndSanitize(AiChatResponse response, out string? errorMessage)
    {
        errorMessage = null;

        if (response == null)
        {
            errorMessage = "AI response was null.";
            return false;
        }

        // 1. Validate and sanitize reply
        if (string.IsNullOrWhiteSpace(response.Reply))
        {
            errorMessage = "AI response reply text is missing or empty.";
            return false;
        }
        response.Reply = SanitizeText(response.Reply, 1000);

        // 2. Validate purpose
        if (!string.IsNullOrWhiteSpace(response.Purpose))
        {
            var matched = AllowedPurposes.FirstOrDefault(p => p.Equals(response.Purpose.Trim(), StringComparison.OrdinalIgnoreCase));
            response.Purpose = matched ?? "Other";
        }

        // 3. Validate and sanitize quick replies
        if (response.QuickReplies != null)
        {
            response.QuickReplies = response.QuickReplies
                .Where(q => !string.IsNullOrWhiteSpace(q))
                .Select(q => SanitizeText(q, 100))
                .Take(8)
                .ToList();
        }

        // 4. Validate lead data if present
        if (response.LeadData != null)
        {
            var data = response.LeadData;

            // Name
            if (!string.IsNullOrWhiteSpace(data.Name))
            {
                data.Name = SanitizeText(data.Name, 100);
            }

            // Email validation
            if (!string.IsNullOrWhiteSpace(data.Email))
            {
                data.Email = data.Email.Trim().ToLowerInvariant();
                if (!IsValidEmail(data.Email))
                {
                    data.Email = null; // Discard invalid email from AI
                }
            }

            // Mobile validation
            if (!string.IsNullOrWhiteSpace(data.Mobile))
            {
                var cleanedPhone = Regex.Replace(data.Mobile, @"[^\d+]", "");
                if (cleanedPhone.Length >= 7 && cleanedPhone.Length <= 20)
                {
                    data.Mobile = cleanedPhone;
                }
                else
                {
                    data.Mobile = null; // Discard invalid phone
                }
            }

            // Purpose
            if (!string.IsNullOrWhiteSpace(data.Purpose))
            {
                var matched = AllowedPurposes.FirstOrDefault(p => p.Equals(data.Purpose.Trim(), StringComparison.OrdinalIgnoreCase));
                data.Purpose = matched ?? "Other";
            }

            // Requirement & details
            if (!string.IsNullOrWhiteSpace(data.Requirement))
            {
                data.Requirement = SanitizeText(data.Requirement, 2000);
            }

            if (!string.IsNullOrWhiteSpace(data.AdditionalDetails))
            {
                data.AdditionalDetails = SanitizeText(data.AdditionalDetails, 2000);
            }

            if (!string.IsNullOrWhiteSpace(data.InterestedProduct))
            {
                data.InterestedProduct = SanitizeText(data.InterestedProduct, 200);
            }

            if (!string.IsNullOrWhiteSpace(data.OrganizationType))
            {
                data.OrganizationType = SanitizeText(data.OrganizationType, 100);
            }

            // Custom fields sanitization
            if (data.CustomFields != null && data.CustomFields.Count > 0)
            {
                var sanitizedFields = new Dictionary<string, string>();
                foreach (var kv in data.CustomFields)
                {
                    var cleanKey = SanitizeText(kv.Key, 100);
                    var cleanVal = SanitizeText(kv.Value, 500);
                    if (!string.IsNullOrEmpty(cleanKey))
                    {
                        sanitizedFields[cleanKey] = cleanVal;
                    }
                }
                data.CustomFields = sanitizedFields;
            }
        }

        return true;
    }

    private static string SanitizeText(string input, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        // Remove HTML/script tags to prevent stored XSS
        var stripped = Regex.Replace(input, @"<[^>]*>", string.Empty);
        stripped = stripped.Trim();

        if (stripped.Length > maxLength)
        {
            stripped = stripped.Substring(0, maxLength);
        }

        return stripped;
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}
