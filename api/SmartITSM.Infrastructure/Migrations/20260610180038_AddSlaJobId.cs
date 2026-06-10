using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartITSM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSlaJobId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SlaJobId",
                table: "Tickets",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SlaJobId",
                table: "Tickets");
        }
    }
}
