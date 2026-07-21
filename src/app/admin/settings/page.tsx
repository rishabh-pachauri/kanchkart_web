export const metadata = {
  title: "Settings | Admin | KanchKart"
};

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-slate-600">Manage your store settings and configuration</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Store Information */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Store Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Store Name
              </label>
              <input
                type="text"
                defaultValue="KanchKart"
                className="w-full px-3 py-2 border rounded-lg"
                disabled
              />
              <p className="text-xs text-slate-500 mt-1">Contact support to change</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue="support@kanchkart.com"
                className="w-full px-3 py-2 border rounded-lg"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 border rounded-lg bg-slate-50">
              <input type="checkbox" checked disabled className="mr-3" />
              <div>
                <p className="font-medium text-sm">Razorpay</p>
                <p className="text-xs text-slate-600">Online payments</p>
              </div>
            </div>
            <div className="flex items-center p-3 border rounded-lg bg-slate-50">
              <input type="checkbox" checked disabled className="mr-3" />
              <div>
                <p className="font-medium text-sm">Cash on Delivery (COD)</p>
                <p className="text-xs text-slate-600">Pay on delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Shipping</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Default Shipping Cost
              </label>
              <input
                type="number"
                defaultValue="50"
                className="w-full px-3 py-2 border rounded-lg"
                disabled
              />
              <p className="text-xs text-slate-500 mt-1">₹ (Rupees)</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Service Area
              </label>
              <select className="w-full px-3 py-2 border rounded-lg" disabled>
                <option>All India</option>
              </select>
            </div>
          </div>
        </div>

        {/* GST Settings */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">GST</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Default GST Rate
              </label>
              <input
                type="number"
                defaultValue="18"
                className="w-full px-3 py-2 border rounded-lg"
                disabled
              />
              <p className="text-xs text-slate-500 mt-1">% (Percentage)</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">
                <strong>GSTIN:</strong> Contact support to update
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
        <p className="text-sm text-blue-800 mb-2">
          To update these settings, please contact our support team at:
        </p>
        <p className="text-sm font-medium text-blue-900">support@kanchkart.com</p>
      </div>
    </div>
  );
}
