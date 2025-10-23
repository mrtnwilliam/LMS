import { useContext, useEffect, useState } from "react"
import { AppContext } from "../../context/AppContext"
import { assets, dummyDashboardData } from "../../assets/assets";
import Loading from "../../components/student/Loading";
import DashboardCard from "../../components/educator/DashboardCard";

const Dashboard = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("AppContext must be used within AppContextProvider");

  const { currency } = context;
  const [dashboardData, setDashboardData] = useState<typeof dummyDashboardData | null>(null)

  const fetchDashboardData = async () => {
    setDashboardData(dummyDashboardData)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return dashboardData ? (
    <div className="min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-5 items-center">

          <DashboardCard
            icon={assets.patients_icon}
            alt="patients_icon"
            value={dashboardData.enrolledStudentsData.length}
            label="Total Enrollments"
          />
          <DashboardCard
            icon={assets.appointments_icon}
            alt="appointments_icon"
            value={dashboardData.totalCourses}
            label="Total Courses"
          />
          <DashboardCard
            icon={assets.earning_icon}
            alt="earning_icon"
            currency={currency}
            value={dashboardData.totalEarnings}
            label="Total Earnings"
          />

        </div>
        <div>
          <h2 className="pb-4 text-lg font-medium">Latest Enrollments</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed md:table-auto w-full overflow-hidden">
              <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Course Title</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {dashboardData.enrolledStudentsData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-500/20">
                    <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                    <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                      <img src={item.student.imageUrl} alt="Profile" className="w-9 h-9 rounded-full" />
                      <span className="truncate">{item.student.name}</span>
                    </td>
                    <td className="px-4 py-3 truncate">{item.courseTitle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default Dashboard