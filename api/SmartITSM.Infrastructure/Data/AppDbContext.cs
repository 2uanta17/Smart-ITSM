using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

using SmartITSM.Core.Constants;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Enums;

namespace SmartITSM.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
{
    public AppDbContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<Department> Departments { get; set; }

    public DbSet<Asset> Assets { get; set; }
    public DbSet<AssetType> AssetTypes { get; set; }

    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<Category> Categories { get; set; }

    public DbSet<TicketStatus> TicketStatuses { get; set; }
    public DbSet<TicketComment> TicketComments { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<SlaPolicy> SlaPolicies { get; set; }
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().ToTable("Users");
        modelBuilder.Entity<IdentityRole<int>>().ToTable("Roles");
        // modelBuilder.Entity<Department>().HasData(
        //     new Department { Id = 1, Name = "IT Support", LocationCode = "HQ-L1" }
        // );
        modelBuilder.Entity<Asset>()
            .Property(a => a.Status)
            .HasConversion<string>();

        // modelBuilder.Entity<IdentityRole<int>>().HasData(
        //     new IdentityRole<int> { Id = 1, Name = AppRoles.Admin, NormalizedName = AppRoles.Admin.ToUpper() },
        //     new IdentityRole<int>
        //     {
        //         Id = 2, Name = AppRoles.Technician, NormalizedName = AppRoles.Technician.ToUpper()
        //     },
        //     new IdentityRole<int> { Id = 3, Name = AppRoles.Requester, NormalizedName = AppRoles.Requester.ToUpper() }
        // );

        // PasswordHasher<User> hasher = new();
        // User admin = new()
        // {
        //     Id = 1,
        //     UserName = "admin@mail.com",
        //     NormalizedUserName = "ADMIN@MAIL.COM",
        //     Email = "admin@mail.com",
        //     NormalizedEmail = "ADMIN@MAIL.COM",
        //     EmailConfirmed = true,
        //     FullName = "System Admin",
        //     DepartmentId = 1,
        //     SecurityStamp = Guid.NewGuid().ToString()
        // };
        // admin.PasswordHash = hasher.HashPassword(admin, "Admin@123");

        // modelBuilder.Entity<User>().HasData(admin);

        // modelBuilder.Entity<IdentityUserRole<int>>().HasData(
        //     new IdentityUserRole<int> { RoleId = 1, UserId = 1 }
        // );

        // modelBuilder.Entity<AssetType>().HasData(
        //     new AssetType { Id = 1, Name = "Laptop" },
        //     new AssetType { Id = 2, Name = "Desktop" },
        //     new AssetType { Id = 3, Name = "Printer" },
        //     new AssetType { Id = 4, Name = "Server" }
        // );

        // modelBuilder.Entity<Category>().HasData(
        //     new Category { Id = 1, Name = "Hardware", DefaultPriority = "Medium", RequiresApproval = true },
        //     new Category { Id = 2, Name = "Software", DefaultPriority = "Low", RequiresApproval = false },
        //     new Category { Id = 3, Name = "Network", DefaultPriority = "High", RequiresApproval = false }
        // );

        // modelBuilder.Entity<TicketStatus>().HasData(
        //     new TicketStatus { Id = 1, Name = "Open" },
        //     new TicketStatus { Id = 2, Name = "Pending" },
        //     new TicketStatus { Id = 3, Name = "In Progress" },
        //     new TicketStatus { Id = 4, Name = "Resolved" },
        //     new TicketStatus { Id = 5, Name = "Closed" },
        //     new TicketStatus { Id = 6, Name = "Pending Approval" }
        // );

        modelBuilder.Entity<TicketComment>()
            .HasOne(tc => tc.Ticket)
            .WithMany()
            .HasForeignKey(tc => tc.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TicketComment>()
            .HasOne(tc => tc.User)
            .WithMany()
            .HasForeignKey(tc => tc.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AuditLog>()
            .HasOne(al => al.Ticket)
            .WithMany()
            .HasForeignKey(al => al.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AuditLog>()
            .HasOne(al => al.User)
            .WithMany()
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // modelBuilder.Entity<SlaPolicy>().HasData(
        //     new SlaPolicy { Id = 1, PriorityLevel = TicketPriority.Low, MaxResponseHours = 24, MaxResolveHours = 48 },
        //     new SlaPolicy { Id = 2, PriorityLevel = TicketPriority.Medium, MaxResponseHours = 8, MaxResolveHours = 24 },
        //     new SlaPolicy { Id = 3, PriorityLevel = TicketPriority.High, MaxResponseHours = 4, MaxResolveHours = 8 },
        //     new SlaPolicy { Id = 4, PriorityLevel = TicketPriority.Critical, MaxResponseHours = 1, MaxResolveHours = 4 }
        // );

        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(a => a.Approver)
            .WithMany()
            .HasForeignKey(a => a.ApproverId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}