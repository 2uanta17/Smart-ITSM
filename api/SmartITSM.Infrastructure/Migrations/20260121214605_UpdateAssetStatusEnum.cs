using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartITSM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAssetStatusEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "a8ad9725-c119-4478-91cf-2d0ec6b5aba6", "AQAAAAIAAYagAAAAEIb+dR2wH7fwiSVYnDndKoCF4Zxr9v9QAkqCniSkyKUwCaMSKaPnukC5mqKhNpERew==", "c7757f95-43ca-45bf-8f54-e41392089e9c" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "a45510d8-5546-41f3-ac46-6dd055b5d7a4", "AQAAAAIAAYagAAAAEKPo1Y+cJPG2O5gIEWqfy4P2SDqzIJGyLGoynxHB62rLBPnwHXyBHCQLkL11Er1ltQ==", "2b78457c-9653-4705-804f-58ca658586a5" });
        }
    }
}
