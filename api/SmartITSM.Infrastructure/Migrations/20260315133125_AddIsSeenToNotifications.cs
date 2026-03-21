using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartITSM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsSeenToNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSeen",
                table: "Notifications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "cf67ea3a-d10b-4bce-8388-31afbc4d627c", "AQAAAAIAAYagAAAAEA8B5X2fMBlwXqdLIskU/xWKmnHPQCZzgsOZls6xBe2hopd03nyR9jO42qWp21xCpw==", "731081aa-a372-4042-8094-0436d51368b5" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSeen",
                table: "Notifications");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "b5ba62b6-e753-4375-9f05-64e88193ac9d", "AQAAAAIAAYagAAAAEApyaB9rRvtlGT2PoWMGdq/nFVsFzAInBMifDayA83OR1jzPI98dzOcChIu5Fy81Sw==", "4da4c1e7-20f3-4dce-b857-b32c42f89fb5" });
        }
    }
}
