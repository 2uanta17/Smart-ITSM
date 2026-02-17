using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartITSM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixCommentColumnName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Comment",
                table: "TicketComments",
                newName: "Content");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "de3f17a2-1f8f-4557-a8bf-3bbc13d50eaf", "AQAAAAIAAYagAAAAEN+lGuguiDZQ/puPSA60CHJXzgheyv+35925zK9bg/JmI1F4iYHPMgDqE1wuLoAWjw==", "154d09d0-f42b-4bfa-9ec3-ea464656f6b7" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Content",
                table: "TicketComments",
                newName: "Comment");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "82707373-94ad-47b0-94ef-f30ce56124cb", "AQAAAAIAAYagAAAAEO7I94daCLEM64klle3zX7zq/v5DOi2Tbc+y0fM5yLDobwEUrLMHLE7QWtzfY159AQ==", "22dd5a62-0970-4437-abf0-2724fb6abca2" });
        }
    }
}
