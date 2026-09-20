using AFTBot.Api.DTOs.Ai;

namespace AFTBot.Api.Services;

public class QualificationQuestion
{
    public string StepKey { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public string FieldName { get; set; } = string.Empty;
    public bool IsFinalQuestion { get; set; } = false;
}

public interface IQualificationFlowService
{
    QualificationQuestion? GetNextQuestion(string purpose, Dictionary<string, string> collectedDetails);
    void ExtractFields(string purpose, string stepKey, string userMessage, Dictionary<string, string> targetDetails);
}

public class QualificationFlowService : IQualificationFlowService
{
    public QualificationQuestion? GetNextQuestion(string purpose, Dictionary<string, string> collectedDetails)
    {
        return purpose switch
        {
            "Software / Product Enquiry" => GetProductEnquiryQuestion(collectedDetails),
            "Training" => GetTrainingQuestion(collectedDetails),
            "Internship" => GetInternshipQuestion(collectedDetails),
            "Software Development" => GetSoftwareDevQuestion(collectedDetails),
            "AI / IoT Solutions" => GetAiIotQuestion(collectedDetails),
            "School / College Solutions" => GetSchoolCollegeQuestion(collectedDetails),
            _ => GetOtherQuestion(collectedDetails)
        };
    }

    public void ExtractFields(string purpose, string stepKey, string userMessage, Dictionary<string, string> targetDetails)
    {
        if (string.IsNullOrWhiteSpace(userMessage)) return;

        targetDetails[stepKey] = userMessage.Trim();
    }

    private static QualificationQuestion? GetProductEnquiryQuestion(Dictionary<string, string> details)
    {
        if (!details.ContainsKey("ProductType"))
        {
            return new QualificationQuestion
            {
                StepKey = "ProductType",
                FieldName = "Product Interested In",
                QuestionText = "Which software product or solution are you interested in?",
                Options = new List<string> { "Enterprise ERP", "School Management", "Custom CRM", "Cloud Inventory", "Other Product" }
            };
        }

        if (!details.ContainsKey("TimelineAndScale"))
        {
            return new QualificationQuestion
            {
                StepKey = "TimelineAndScale",
                FieldName = "Timeline & User Scale",
                QuestionText = "What is your organization type, expected number of users, and deployment timeline?",
                Options = new List<string> { "Enterprise (> 100 users)", "Small / Medium Business", "Timeline: Immediate (< 1 mo)", "Timeline: 1 - 3 months" },
                IsFinalQuestion = true
            };
        }

        return null;
    }

    private static QualificationQuestion? GetTrainingQuestion(Dictionary<string, string> details)
    {
        if (!details.ContainsKey("CourseAndProfile"))
        {
            return new QualificationQuestion
            {
                StepKey = "CourseAndProfile",
                FieldName = "Course & Profile",
                QuestionText = "Which course or technology are you interested in, and are you a student or working professional?",
                Options = new List<string> { "Full Stack .NET", "Angular & React", "AI & Data Science", "Cloud & DevOps", "I am a Student", "Working Professional" }
            };
        }

        if (!details.ContainsKey("ModeAndDate"))
        {
            return new QualificationQuestion
            {
                StepKey = "ModeAndDate",
                FieldName = "Training Mode & Start Date",
                QuestionText = "Do you prefer online or offline training, and when would you like to start?",
                Options = new List<string> { "Online Live Classes", "Offline Classroom", "Weekend Batch", "Starting Next Month", "Immediate Start" },
                IsFinalQuestion = true
            };
        }

        return null;
    }

    private static QualificationQuestion? GetInternshipQuestion(Dictionary<string, string> details)
    {
        if (!details.ContainsKey("DomainAndCollege"))
        {
            return new QualificationQuestion
            {
                StepKey = "DomainAndCollege",
                FieldName = "College & Tech Domain",
                QuestionText = "What is your college or degree, and which technology domain interests you for your internship?",
                Options = new List<string> { "Web Development (.NET/Angular)", "AI / Machine Learning", "IoT & Embedded", "Cloud Systems", "B.Tech / MCA", "Final Year Student" }
            };
        }

        if (!details.ContainsKey("DurationAndMode"))
        {
            return new QualificationQuestion
            {
                StepKey = "DurationAndMode",
                FieldName = "Duration & Mode",
                QuestionText = "What internship duration do you prefer (e.g. 3 months, 6 months) and online or offline?",
                Options = new List<string> { "3 Months Duration", "6 Months Duration", "Online / Remote", "Offline In-Office" },
                IsFinalQuestion = true
            };
        }

        return null;
    }

    private static QualificationQuestion? GetSoftwareDevQuestion(Dictionary<string, string> details)
    {
        if (!details.ContainsKey("ProjectType"))
        {
            return new QualificationQuestion
            {
                StepKey = "ProjectType",
                FieldName = "Project Type",
                QuestionText = "What kind of software project are you planning for your organization?",
                Options = new List<string> { "Custom Web Application", "Mobile App (iOS/Android)", "Enterprise Software / SaaS", "Cloud Migration / Modernization" }
            };
        }

        if (!details.ContainsKey("TimelineAndBudget"))
        {
            return new QualificationQuestion
            {
                StepKey = "TimelineAndBudget",
                FieldName = "Timeline & Budget",
                QuestionText = "What is your expected project timeline and approximate budget range?",
                Options = new List<string> { "Timeline: 1 - 3 months", "Timeline: 3 - 6 months", "Budget: Under $15k", "Budget: $15k - $50k", "Budget: Flexible" },
                IsFinalQuestion = true
            };
        }

        return null;
    }

    private static QualificationQuestion? GetAiIotQuestion(Dictionary<string, string> details)
    {
        if (!details.ContainsKey("ProblemAndUseCase"))
        {
            return new QualificationQuestion
            {
                StepKey = "ProblemAndUseCase",
                FieldName = "AI/IoT Use Case",
                QuestionText = "What specific problem or operational use case are you aiming to solve with AI or IoT?",
                Options = new List<string> { "Predictive Maintenance", "Computer Vision / AI", "Smart Automation & Telemetry", "Sensor Analytics / Edge AI" }
            };
        }

        if (!details.ContainsKey("DevicesAndTimeline"))
        {
            return new QualificationQuestion
            {
                StepKey = "DevicesAndTimeline",
                FieldName = "Scale & Timeline",
                QuestionText = "How many devices or users will be connected, and what is your deployment timeline?",
                Options = new List<string> { "< 50 devices", "50 - 500 devices", "500+ devices", "Immediate (< 1 month)", "1 - 3 months" },
                IsFinalQuestion = true
            };
        }

        return null;
    }

    private static QualificationQuestion? GetSchoolCollegeQuestion(Dictionary<string, string> details)
    {
        if (!details.ContainsKey("InstitutionInfo"))
        {
            return new QualificationQuestion
            {
                StepKey = "InstitutionInfo",
                FieldName = "Institution Info",
                QuestionText = "What is your institution type and approximate number of students?",
                Options = new List<string> { "School (K-12)", "College / University", "Coaching Institute", "< 500 Students", "500 - 2000 Students", "2000+ Students" }
            };
        }

        if (!details.ContainsKey("ModulesRequired"))
        {
            return new QualificationQuestion
            {
                StepKey = "ModulesRequired",
                FieldName = "Modules Required",
                QuestionText = "Which modules do you require?",
                Options = new List<string> { "Attendance & Homework", "Fee Management", "Bus Tracking (IoT/GPS)", "Parent Mobile App", "Complete ERP Suite" },
                IsFinalQuestion = true
            };
        }

        return null;
    }

    private static QualificationQuestion? GetOtherQuestion(Dictionary<string, string> details)
    {
        if (!details.ContainsKey("GeneralRequirement"))
        {
            return new QualificationQuestion
            {
                StepKey = "GeneralRequirement",
                FieldName = "General Requirement",
                QuestionText = "Could you please describe how Apex Falcon Technologies can assist your organization?",
                Options = new List<string> { "General Inquiry", "Partnership / Collaboration", "Schedule a Consultation" },
                IsFinalQuestion = true
            };
        }

        return null;
    }
}
