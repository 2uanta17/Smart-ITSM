using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartITSM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsActiveUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "IsActive", "PasswordHash", "SecurityStamp" },
                values: new object[] { "5c9601a7-4433-4dfc-8fed-62356161496e", true, "AQAAAAIAAYagAAAAEPbqEKtj6NYMvyr+Dp29HiaQKDzgq/6clWrR+/UfG7yIOJoX71isH7F8TCKD2xBUyg==", "26e25759-6603-42e8-97a3-6fdf326df5fe" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "d9766d72-bd97-49a3-beb6-57934ff1e456", "AQAAAAIAAYagAAAAEMRCZKBP5JRgP3vxSWNdvDxqMJKcVI9vfo2XjJXO7lySO21u7ZHWSGB0N8ma8lpP4w==", "07e127df-ff1c-45f2-9459-a2ec0fb38730" });
        }
    }
}
