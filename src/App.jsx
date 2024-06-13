import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from 'react-query';

const queryClient = new QueryClient();

const fetchDepartments = async () => {
  const res = await axios.get('http://localhost:3030/departments');
  return res.data; // Assuming your API returns data directly as an array
};

const createDepartment = async (newDepartment) => {
  const res = await axios.post('http://localhost:3030/departments', newDepartment);
  return res.data;
};

const updateDepartment = async (updatedDepartment) => {
  const res = await axios.put(
    `http://localhost:3030/departments/${updatedDepartment.id}`,
    updatedDepartment
  );
  return res.data;
};

const deleteDepartment = async (id) => {
  await axios.delete(`http://localhost:3030/departments/${id}`);
};

const Axios = () => {
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    employees: [{ id: generateRandomId(), name: '', position: '', skills: [{ name: '' }] }],
  });
  const [updateDepartmentData, setUpdateDepartmentData] = useState(null);
  const queryClient = useQueryClient();

  const { data: departments, isLoading, error, refetch } = useQuery('departments', fetchDepartments);

  const createMutation = useMutation(createDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries('departments');
      setNewDepartment({
        name: '',
        employees: [{ id: generateRandomId(), name: '', position: '', skills: [{ name: '' }] }],
      });
    },
  });

  const updateMutation = useMutation(updateDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries('departments');
      setUpdateDepartmentData(null);
    },
  });

  const deleteMutation = useMutation(deleteDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries('departments');
    },
  });

  const handleNewDepartmentChange = (e) => {
    setNewDepartment({ ...newDepartment, [e.target.name]: e.target.value });
  };

  const handleNewEmployeeChange = (e, index) => {
    const updatedEmployees = [...newDepartment.employees];
    updatedEmployees[index][e.target.name] = e.target.value;
    setNewDepartment({ ...newDepartment, employees: updatedEmployees });
  };

  const handleNewSkillChange = (e, employeeIndex, skillIndex) => {
    const updatedEmployees = [...newDepartment.employees];
    updatedEmployees[employeeIndex].skills[skillIndex][e.target.name] = e.target.value;
    setNewDepartment({ ...newDepartment, employees: updatedEmployees });
  };

  const handleNewEmployeeAdd = () => {
    setNewDepartment({
      ...newDepartment,
      employees: [...newDepartment.employees, { id: generateRandomId(), name: '', position: '', skills: [{ name: '' }] }],
    });
  };

  const handleNewSkillAdd = (employeeIndex) => {
    const updatedEmployees = [...newDepartment.employees];
    updatedEmployees[employeeIndex].skills.push({ name: '' });
    setNewDepartment({ ...newDepartment, employees: updatedEmployees });
  };

  const handleNewDepartmentSubmit = () => {
    createMutation.mutate({
      ...newDepartment,
      employees: newDepartment.employees.map(employee => ({
        ...employee,
        id: employee.id || generateRandomId() // Ensure every employee has a unique ID
      }))
    });
  };

  const handleEdit = (department) => {
    setUpdateDepartmentData(department);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateDepartmentData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleUpdateEmployeeChange = (e, index) => {
    const updatedEmployees = [...updateDepartmentData.employees];
    updatedEmployees[index][e.target.name] = e.target.value;
    setUpdateDepartmentData(prevData => ({
      ...prevData,
      employees: updatedEmployees
    }));
  };

  const handleUpdateSkillChange = (e, employeeIndex, skillIndex) => {
    const updatedEmployees = [...updateDepartmentData.employees];
    updatedEmployees[employeeIndex].skills[skillIndex][e.target.name] = e.target.value;
    setUpdateDepartmentData(prevData => ({
      ...prevData,
      employees: updatedEmployees
    }));
  };

  const handleUpdateEmployeeAdd = () => {
    setUpdateDepartmentData(prevData => ({
      ...prevData,
      employees: [...prevData.employees, { id: generateRandomId(), name: '', position: '', skills: [{ name: '' }] }],
    }));
  };

  const handleUpdateSkillAdd = (employeeIndex) => {
    const updatedEmployees = [...updateDepartmentData.employees];
    updatedEmployees[employeeIndex].skills.push({ name: '' });
    setUpdateDepartmentData(prevData => ({
      ...prevData,
      employees: updatedEmployees
    }));
  };

  const handleUpdateSubmit = () => {
    updateMutation.mutate(updateDepartmentData);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5 text-red-500">An error occurred: {error.message}</div>;

  return (
    <div className="p-5">
      {/* Create New Department Form */}
      <div className="bg-white shadow-md rounded p-5 mb-5">
        <h2 className="text-2xl font-bold mb-5">Create New Department</h2>
        <input
          className="border rounded w-full py-2 px-3 mb-3"
          type="text"
          name="name"
          value={newDepartment.name}
          onChange={handleNewDepartmentChange}
          placeholder="Department Name"
        />
        {newDepartment.employees.map((employee, index) => (
          <div key={employee.id} className="mb-3">
            <input
              className="border rounded w-full py-2 px-3 mb-3"
              type="text"
              name="name"
              value={employee.name}
              onChange={(e) => handleNewEmployeeChange(e, index)}
              placeholder="Employee Name"
            />
            <input
              className="border rounded w-full py-2 px-3 mb-3"
              type="text"
              name="position"
              value={employee.position}
              onChange={(e) => handleNewEmployeeChange(e, index)}
              placeholder="Employee Position"
            />
            {employee.skills.map((skill, skillIndex) => (
              <div key={`skill-${skillIndex}`} className="mb-3">
                <input
                  className="border rounded w-full py-2 px-3"
                  type="text"
                  name="name"
                  value={skill.name}
                  onChange={(e) => handleNewSkillChange(e, index, skillIndex)}
                  placeholder="Skill Name"
                />
              </div>
            ))}
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded mt-2"
              onClick={() => handleNewSkillAdd(index)}
            >
              Add Skill
            </button>
          </div>
        ))}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-3"
          onClick={handleNewEmployeeAdd}
        >
          Add Employee
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleNewDepartmentSubmit}
        >
          Add Department
        </button>
      </div>

      {/* Update Department Form */}
      {updateDepartmentData && (
        <div className="bg-white shadow-md rounded p-5 mb-5">
          <h2 className="text-2xl font-bold mb-5">Update Department</h2>
          <input
            className="border rounded w-full py-2 px-3 mb-3"
            type="text"
            name="name"
            value={updateDepartmentData.name || ''}
            onChange={handleUpdateChange}
            placeholder="Updated Department Name"
          />
          {updateDepartmentData.employees.map((employee, index) => (
            <div key={employee.id} className="mb-3">
              <input
                className="border rounded w-full py-2 px-3 mb-3"
                type="text"
                name="name"
                value={employee.name}
                onChange={(e) => handleUpdateEmployeeChange(e, index)}
                placeholder="Employee Name"
              />
              <input
                className="border rounded w-full py-2 px-3 mb-3"
                type="text"
                name="position"
                value={employee.position}
                onChange={(e) => handleUpdateEmployeeChange(e, index)}
                placeholder="Employee Position"
              />
              {employee.skills.map((skill, skillIndex) => (
                <div key={`skill-${skillIndex}`} className="mb-3">
                  <input
                    className="border rounded w-full py-2 px-3"
                    type="text"
                    name="name"
                    value={skill.name}
                    onChange={(e) => handleUpdateSkillChange(e, index, skillIndex)}
                    placeholder="Skill Name"
                  />
                </div>
              ))}
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded mt-2"
                onClick={() => handleUpdateSkillAdd(index)}
              >
                Add Skill
              </button>
            </div>
          ))}
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleUpdateSubmit}
          >
            Update Department
          </button>
        </div>
      )}

      {/* List of Departments */}
      {departments && departments.map((department) => (
        <div key={department.id} className="bg-gray-100 shadow-md rounded p-5 mb-5">
          <h1 className="text-xl font-bold">{department.name}</h1>
          {department.employees.map((employee) => (
            <div key={employee.id} className="my-3">
              <p className="font-medium">{employee.name} - {employee.position}</p>
              <ul className="list-disc list-inside">
                {employee.skills.map((skill, skillIndex) => (
                  <li key={`skill-${skillIndex}`}>{skill.name}</li>
                ))}
              </ul>
            </div>
          ))}
          <button
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded mr-2"
            onClick={() => handleEdit(department)}
          >
            Edit
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
            onClick={() => handleDelete(department.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

// Function to generate a random numeric ID
const generateRandomId = () => {
  return Math.floor(Math.random() * 1000000); // Generates IDs between 0 and 999999
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <div className="container mx-auto p-5">
      <Axios />
    </div>
  </QueryClientProvider>
);

export default App;
