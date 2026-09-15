import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Spinner from '../../components/common/Spinner'

const cards = [
  { key: 'products', label: 'Products', color: 'bg-blue-500' },
  { key: 'stockIn', label: 'Total Stock In', color: 'bg-emerald-500' },
  { key: 'stockOut', label: 'Total Stock Out', color: 'bg-orange-500' },
  { key: 'current', label: 'Current Stock', color: 'bg-purple-500' },
]

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ products: 0, stockIn: 0, stockOut: 0, current: 0 })
  const [recentIn, setRecentIn] = useState([])
  const [recentOut, setRecentOut] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [products, stockIn, stockOut, totalStock] = await Promise.all([
          api.get('/stock/potential-stock/'),
          api.get('/stock/stock-in/'),
          api.get('/stock/stock-out/'),
          api.get('/stock/total-stock/'),
        ])

        const current = totalStock.data.reduce((sum, t) => sum + t.current_stock, 0)

        setStats({
          products: products.data.length,
          stockIn: stockIn.data.length,
          stockOut: stockOut.data.length,
          current,
        })
        setRecentIn(stockIn.data.slice(-5).reverse())
        setRecentOut(stockOut.data.slice(-5).reverse())
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(({ key, label, color }) => (
          <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats[key]}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Stock In</h2>
          {recentIn.length === 0 ? (
            <p className="text-sm text-gray-400">No records yet.</p>
          ) : (
            <div className="space-y-3">
              {recentIn.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.product_name_display}</p>
                    <p className="text-xs text-gray-400">HSN: {item.hsn_code_display}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">+{item.quantity}</p>
                    <p className="text-xs text-gray-400">Total: {item.total_quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Stock Out</h2>
          {recentOut.length === 0 ? (
            <p className="text-sm text-gray-400">No records yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOut.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.product_name_display}</p>
                    <p className="text-xs text-gray-400">HSN: {item.hsn_code_display}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-600">-{item.quantity}</p>
                    <p className="text-xs text-gray-400">Stock left: {item.current_stock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
