using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartITSM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    RelatedTicketId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "b5ba62b6-e753-4375-9f05-64e88193ac9d", "AQAAAAIAAYagAAAAEApyaB9rRvtlGT2PoWMGdq/nFVsFzAInBMifDayA83OR1jzPI98dzOcChIu5Fy81Sw==", "4da4c1e7-20f3-4dce-b857-b32c42f89fb5" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "3b3711a3-6791-4cf6-9f7b-b887b9098f4d", "AQAAAAIAAYagAAAAEB11rpS50lr0iqIIdDs8ucyZ5f0A7UUmtklNQaHbGdHUTkHOHEF8P56Ey0/U9jHG5g==", "82595c31-e7db-46cf-a62f-ad42c7dda613" });
        }
    }
}
