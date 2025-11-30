using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeliveryService.Migrations
{
    /// <inheritdoc />
    public partial class PendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Occupied",
                table: "Drivers",
                newName: "occupied");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Drivers",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Drivers",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Deliveries",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Deliveries",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "OrderId",
                table: "Deliveries",
                newName: "order_id");

            migrationBuilder.RenameColumn(
                name: "DriverId",
                table: "Deliveries",
                newName: "driver_id");

            migrationBuilder.RenameColumn(
                name: "DeliveryDate",
                table: "Deliveries",
                newName: "delivery_date");

            migrationBuilder.RenameColumn(
                name: "Address",
                table: "Deliveries",
                newName: "addres");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "occupied",
                table: "Drivers",
                newName: "Occupied");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Drivers",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Drivers",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "Deliveries",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Deliveries",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "order_id",
                table: "Deliveries",
                newName: "OrderId");

            migrationBuilder.RenameColumn(
                name: "driver_id",
                table: "Deliveries",
                newName: "DriverId");

            migrationBuilder.RenameColumn(
                name: "delivery_date",
                table: "Deliveries",
                newName: "DeliveryDate");

            migrationBuilder.RenameColumn(
                name: "addres",
                table: "Deliveries",
                newName: "Address");
        }
    }
}
