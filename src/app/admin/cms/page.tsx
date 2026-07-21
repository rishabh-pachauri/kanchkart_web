import { db } from "@/lib/db";
import { CmsForm } from "@/components/admin/cms-form";

export const metadata = {
  title: "CMS & Content | Admin | KanchKart"
};

export default async function CMSPage() {
  const sections = await db.cmsSection.findMany({
    orderBy: { placement: "asc" }
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CMS & Content Management</h1>
        <p className="text-slate-600">
          Manage hero images, banners, content blocks, and website sections
        </p>
      </div>

      {/* Form Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Add or Edit Content Section</h2>
        <CmsForm />
      </div>

      {/* Existing Sections */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">Existing Sections</h2>

        {sections.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-slate-600">No CMS sections yet. Create one using the form above!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="rounded-lg border bg-white p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left Side - Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        {section.placement.replaceAll("_", " ")}
                      </span>
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
                        {section.key}
                      </span>
                      {section.isActive ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                          Inactive
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {section.title}
                    </h3>

                    {section.eyebrow && (
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Eyebrow:</strong> {section.eyebrow}
                      </p>
                    )}

                    {section.body && (
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                        <strong>Content:</strong> {section.body}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 mt-3">
                      {section.imageUrl && (
                        <a
                          href={section.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          📷 View Image
                        </a>
                      )}
                      {section.videoUrl && (
                        <a
                          href={section.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          🎥 View Video
                        </a>
                      )}
                      {section.ctaHref && (
                        <p className="text-xs text-slate-600">
                          CTA: <strong>{section.ctaLabel}</strong> → {section.ctaHref}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Image Preview */}
                  {section.imageUrl && (
                    <div className="md:w-48">
                      <img
                        src={section.imageUrl}
                        alt={section.title}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-16 rounded-lg bg-blue-50 border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-3">How to Use CMS</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✅ <strong>Key:</strong> Unique identifier (e.g., "home-hero", "about-section")</li>
          <li>✅ <strong>Placement:</strong> Where this content appears on your site</li>
          <li>✅ <strong>Image URL:</strong> Paste your image URL from Cloudinary, Unsplash, etc</li>
          <li>✅ <strong>Title & Body:</strong> Main content text</li>
          <li>✅ <strong>CTA:</strong> Call-to-action button (label + link)</li>
          <li>✅ <strong>Active:</strong> Toggle to show/hide sections</li>
        </ul>
      </div>
    </div>
  );
}
