
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

const stats = [
    { label: "New orders", value: 12 },
    { label: "Out for delivery", value: 5 },
    { label: "Upcoming", value: 132, change: -0.3 },
    { label: "Completed orders", value: 540, change: 2.5 }
]

const StatSection = ({ empty = false }: { empty?: boolean }) => {
    return (
        <section className="grid mt-5 grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="border h-36.25 bg-white border-grey-200 rounded-md flex flex-col"
                >
                    <div className="p-2.5 border-b">
                        <h3 className="text-xs font-medium text-grey-800">
                            {stat.label}
                        </h3>
                    </div>

                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <h3 className="text-2xl mt-2 font-semibold text-grey-800">
                            {empty ? 0 : stat.value}
                        </h3>

                        {stat.change !== undefined && (
                            <div className="flex items-center justify-between">
                                <div className={`flex items-center gap-1 text-xs font-semibold ${stat.change >= 0 ? "text-green-600" : "text-red-600"
                                    }`}>
                                    {stat.change >= 0 ? (
                                        <ArrowUpRight size={14} />
                                    ) : (
                                        <ArrowDownLeft size={14} />
                                    )}

                                    <span>{empty ? 0 : Math.abs(stat.change)}%</span>
                                </div>

                                <span className="text-xs text-grey-800 font-medium">
                                    vs last month
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </section>
    )
}

export default StatSection
