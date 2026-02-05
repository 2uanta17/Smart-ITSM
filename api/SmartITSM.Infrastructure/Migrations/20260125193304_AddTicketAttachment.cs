using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartITSM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketAttachment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AttachmentPath",
                table: "Tickets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "4fcce410-b1b9-4927-8bf2-bc71b3ac9ab6", "AQAAAAIAAYagAAAAEFiq8MnhAI401mXmyxY4hM36YONp+6FCcLQCsKtcloQwkQULjdIXPAFe02D0r8ojMw==", "a6cee29c-bdb4-41c9-90c7-6fe4f10f0bd5" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AttachmentPath",
                table: "Tickets");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "a8ad9725-c119-4478-91cf-2d0ec6b5aba6", "AQAAAAIAAYagAAAAEIb+dR2wH7fwiSVYnDndKoCF4Zxr9v9QAkqCniSkyKUwCaMSKaPnukC5mqKhNpERew==", "c7757f95-43ca-45bf-8f54-e41392089e9c" });
        }
    }
}
