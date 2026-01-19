using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SmartITSM.Core.Entities;

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
    
    // Data seeding
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Config
        modelBuilder.Entity<User>().ToTable("Users");
        modelBuilder.Entity<IdentityRole<int>>().ToTable("Roles");
        
        // Seed Department
        modelBuilder.Entity<Department>().HasData(
            new Department { Id = 1, Name = "IT Support", LocationCode = "HQ-L1" }
        );
        
        // Seed Roles
        modelBuilder.Entity<IdentityRole<int>>().HasData(
            new IdentityRole<int> { Id = 1, Name = "Admin", NormalizedName = "ADMIN" },
            new IdentityRole<int> { Id = 2, Name = "Technician", NormalizedName = "TECHNICIAN" },
            new IdentityRole<int> { Id = 3, Name = "Requester", NormalizedName = "REQUESTER" }
        );
        
        var hasher = new PasswordHasher<User>();
        var admin = new User
        {
            Id = 1,
            UserName = "admin@mail.com",
            NormalizedUserName = "ADMIN@MAIL.COM",
            Email = "admin@mail.com",
            NormalizedEmail = "ADMIN@MAIL.COM",
            EmailConfirmed = true,
            FullName = "System Admin",
            DepartmentId = 1,
            SecurityStamp = Guid.NewGuid().ToString()
        };
        admin.PasswordHash = hasher.HashPassword(admin, "Admin@123");
        
        modelBuilder.Entity<User>().HasData(admin);
        
        // Assign Role to Admin
        modelBuilder.Entity<IdentityUserRole<int>>().HasData(
            new IdentityUserRole<int> { RoleId = 1, UserId = 1 }
        );

        // Asset Types
        modelBuilder.Entity<AssetType>().HasData(
            new AssetType { Id = 1, Name = "Laptop" },
            new AssetType { Id = 2, Name = "Desktop" },
            new AssetType { Id = 3, Name = "Printer" },
            new AssetType { Id = 4, Name = "Server" }
        );

        // Categories
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Hardware", DefaultPriority = "Medium" },
            new Category { Id = 2, Name = "Software", DefaultPriority = "Low" },
            new Category { Id = 3, Name = "Network", DefaultPriority = "High" }
        );

        // Statuses
        modelBuilder.Entity<TicketStatus>().HasData(
            new TicketStatus { Id = 1, Name = "Open" },
            new TicketStatus { Id = 2, Name = "Pending" },
            new TicketStatus { Id = 3, Name = "In Progress" },
            new TicketStatus { Id = 4, Name = "Resolved" },
            new TicketStatus { Id = 5, Name = "Closed" }
        );
    }
}