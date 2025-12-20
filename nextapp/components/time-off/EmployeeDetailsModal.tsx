import { CoverageDay, EmployeeStatus } from 'types/time-off';

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: CoverageDay | null;
  formatDate: (date: Date | string) => string;
}

export default function EmployeeDetailsModal({
  isOpen,
  onClose,
  day,
  formatDate,
}: EmployeeDetailsModalProps) {
  if (!isOpen || !day) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Employee Status for {formatDate(day.date)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 font-semibold border-b pb-2">
              <div>Name</div>
              <div>Role</div>
              <div>Status</div>
            </div>

            {day.employees.map((employee: EmployeeStatus, index: number) => (
              <div key={index} className="grid grid-cols-3 gap-4 border-b pb-2">
                <div>{employee.name}</div>
                <div>{employee.role}</div>
                <div
                  className={
                    employee.isAvailable ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {employee.isAvailable ? 'Available' : 'On Leave'}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
