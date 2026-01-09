using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _repository;

    public DepartmentService(IDepartmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<DepartmentDto>> GetAllAsync()
    {
        var departments = await _repository.GetAllAsync();
        return departments.Select(d => new DepartmentDto(d.Id, d.Name, d.LocationCode));
    }

    public async Task<DepartmentDto?> GetByIdAsync(int id)
    {
        var department = await _repository.GetByIdAsync(id);
        if (department == null) return null;

        return new DepartmentDto(department.Id, department.Name, department.LocationCode);
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto)
    {
        var department = new Department
        {
            Name = dto.Name,
            LocationCode = dto.LocationCode
        };

        var created = await _repository.AddAsync(department);
        return new DepartmentDto(created.Id, created.Name, created.LocationCode);
    }

    public async Task<bool> UpdateAsync(int id, UpdateDepartmentDto dto)
    {
        var department = await _repository.GetByIdAsync(id);
        if (department == null) return false;

        department.Name = dto.Name;
        department.LocationCode = dto.LocationCode;

        await _repository.UpdateAsync(department);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var department = await _repository.GetByIdAsync(id);
        if (department == null) return false;

        await _repository.DeleteAsync(department);
        return true;
    }
}