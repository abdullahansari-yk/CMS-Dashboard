  
import { useState } from "react";
import "./App.css";

const initialPages = [
  {
    id: 1,
    title: "Home Page",
    slug: "/",
    status: "Published",
    heading: "Welcome to Our Website",
    description: "Discover our services and learn more about what we do.",
    image: "",
  },
  {
    id: 2,
    title: "About Us",
    slug: "/about",
    status: "Published",
    heading: "About Our Company",
    description: "Learn more about our company and our mission.",
    image: "",
  },
  {
    id: 3,
    title: "Our Services",
    slug: "/services",
    status: "Draft",
    heading: "Our Services",
    description: "Explore the services we offer.",
    image: "",
  },
];

function App() {
  const [pages, setPages] = useState(initialPages);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [activeView, setActiveView] = useState("Overview");

  const publishedCount = pages.filter(
    (page) => page.status === "Published"
  ).length;

  const draftCount = pages.filter(
    (page) => page.status === "Draft"
  ).length;

  function openEditor(page) {
    setSelectedPageId(page.id);
    setFormData({ ...page });
    setActiveView("Editor");
  }

  function createPage() {
    const newPage = {
      id: Date.now(),
      title: "Untitled Page",
      slug: "/untitled-page",
      status: "Draft",
      heading: "",
      description: "",
      image: "",
    };

    setPages((currentPages) => [...currentPages, newPage]);
    setSelectedPageId(newPage.id);
    setFormData({ ...newPage });
    setActiveView("Editor");
  }

  function updateField(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function savePage(event) {
    event.preventDefault();

    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === selectedPageId
          ? { ...page, ...formData }
          : page
      )
    );

    setActiveView("Pages");
  }

  function deletePage(pageId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this page?"
    );

    if (!confirmed) return;

    setPages((currentPages) =>
      currentPages.filter((page) => page.id !== pageId)
    );

    if (selectedPageId === pageId) {
      setSelectedPageId(null);
      setFormData(null);
      setActiveView("Pages");
    }
  }

  function handleImageUpload(event) {
    const files = Array.from(event.target.files || []);
    const errors = [];
    const validFiles = [];

    setUploadError("");

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not an image.`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} exceeds the 5 MB limit.`);
        continue;
      }

      validFiles.push({
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
      });
    }

    setMediaFiles((currentFiles) => [
      ...currentFiles,
      ...validFiles,
    ]);

    if (errors.length > 0) {
      setUploadError(errors.join(" "));
    }

    // Allow selecting the same file again.
    event.target.value = "";
  }

  function deleteImage(imageId) {
    const image = mediaFiles.find(
      (file) => file.id === imageId
    );

    if (!image) return;

    const confirmed = window.confirm(
      `Delete "${image.name}" from the media library?`
    );

    if (!confirmed) return;

    // Remove this image from any page that uses it.
    setPages((currentPages) =>
      currentPages.map((page) =>
        page.image === image.url
          ? { ...page, image: "" }
          : page
      )
    );

    setFormData((currentData) =>
      currentData?.image === image.url
        ? { ...currentData, image: "" }
        : currentData
    );

    setMediaFiles((currentFiles) =>
      currentFiles.filter((file) => file.id !== imageId)
    );

    // Revoke only the URL of the image being deleted.
    URL.revokeObjectURL(image.url);
  }

  function renderSidebar() {
    const menuItems = [
      { label: "Overview", icon: "▦" },
      { label: "Pages", icon: "▤" },
      { label: "Media Library", icon: "▧" },
      { label: "Settings", icon: "⚙" },
    ];

    return (
      <aside className="sidebar">
        <h2 className="logo">
          ContentFlow<span>.</span>
        </h2>

        <p className="menu-label">WORKSPACE</p>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`nav-link ${
                activeView === item.label ? "active" : ""
              }`}
              onClick={() => setActiveView(item.label)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="avatar">AA</div>

          <div>
            <strong>Admin User</strong>
            <p>Content Editor</p>
          </div>
        </div>
      </aside>
    );
  }

  function renderPageTable(pageList) {
    if (pageList.length === 0) {
      return (
        <div className="empty-state">
          <h3>No pages yet</h3>
          <p>Create your first page to get started.</p>

          <button
            className="primary-button"
            onClick={createPage}
          >
            + Create page
          </button>
        </div>
      );
    }

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>PAGE</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {pageList.map((page) => (
              <tr key={page.id}>
                <td>
                  <strong>{page.title}</strong>
                  <p>{page.slug}</p>
                </td>

                <td>
                  <span
                    className={`status ${
                      page.status === "Published"
                        ? "published"
                        : "draft"
                    }`}
                  >
                    {page.status}
                  </span>
                </td>

                <td>
                  <div className="row-actions">
                    <button
                      className="edit-button"
                      onClick={() => openEditor(page)}
                    >
                      Edit →
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => deletePage(page.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderOverview() {
    return (
      <>
        <section className="welcome-section">
          <div>
            <h2>Welcome back!</h2>
            <p>Manage your website content from one place.</p>
          </div>

          <button
            className="primary-button"
            onClick={createPage}
          >
            + Create page
          </button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Pages</p>
            <h2>{pages.length}</h2>
            <span>All website pages</span>
          </div>

          <div className="stat-card">
            <p>Published</p>
            <h2>{publishedCount}</h2>
            <span>Live pages</span>
          </div>

          <div className="stat-card">
            <p>Drafts</p>
            <h2>{draftCount}</h2>
            <span>Work in progress</span>
          </div>

          <div className="stat-card">
            <p>Media Files</p>
            <h2>{mediaFiles.length}</h2>
            <span>Uploaded images</span>
          </div>
        </section>

        <section className="pages-section">
          <div className="section-heading">
            <div>
              <h2>Your Pages</h2>
              <p>Manage the content of your website.</p>
            </div>

            <button
              className="secondary-button"
              onClick={() => setActiveView("Pages")}
            >
              View all pages →
            </button>
          </div>

          {renderPageTable(pages.slice(0, 3))}
        </section>
      </>
    );
  }

  function renderPages() {
    return (
      <section className="pages-section">
        <div className="section-heading">
          <div>
            <h2>All Pages</h2>
            <p>Create and manage your website pages.</p>
          </div>

          <button
            className="primary-button"
            onClick={createPage}
          >
            + Create page
          </button>
        </div>

        {renderPageTable(pages)}
      </section>
    );
  }

  function renderEditor() {
    if (!formData) {
      return (
        <section className="pages-section">
          <h2>No page selected</h2>

          <button
            className="secondary-button"
            onClick={() => setActiveView("Pages")}
          >
            ← Back to pages
          </button>
        </section>
      );
    }

    return (
      <section className="pages-section">
        <div className="section-heading">
          <div>
            <h2>Edit Page</h2>
            <p>Changes appear in the preview as you type.</p>
          </div>

          <button
            className="secondary-button"
            onClick={() => setActiveView("Pages")}
          >
            ← Back to pages
          </button>
        </div>

        <div className="editor-layout">
          <form className="editor-form" onSubmit={savePage}>
            <h3>Page Content</h3>

            <label>
              Page title
              <input
                name="title"
                value={formData.title}
                onChange={updateField}
                required
              />
            </label>

            <label>
              URL slug
              <input
                name="slug"
                value={formData.slug}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Main heading
              <input
                name="heading"
                value={formData.heading}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={updateField}
                rows={5}
              />
            </label>

            <label>
              Featured Image
              <select
                name="image"
                value={formData.image || ""}
                onChange={updateField}
              >
                <option value="">No image selected</option>

                {mediaFiles.map((file) => (
                  <option key={file.id} value={file.url}>
                    {file.name}
                  </option>
                ))}
              </select>
            </label>

            {formData.image && (
              <div className="selected-image-preview">
                <img
                  src={formData.image}
                  alt={formData.heading || formData.title}
                />

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setFormData((currentData) => ({
                      ...currentData,
                      image: "",
                    }))
                  }
                >
                  Remove from page
                </button>
              </div>
            )}

            <label>
              Page status
              <select
                name="status"
                value={formData.status}
                onChange={updateField}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setActiveView("Pages")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Save changes
              </button>
            </div>
          </form>

          <div className="preview-panel">
            <div className="preview-toolbar">
              <span>LIVE PREVIEW</span>
              <span className="preview-indicator">
                ● Updating
              </span>
            </div>

            <div className="website-preview">
              <nav className="preview-nav">
                <strong>{formData.title || "Untitled Page"}</strong>
                <span>Home&nbsp;&nbsp; About&nbsp;&nbsp; Contact</span>
              </nav>

              <section className="preview-hero">
                <span className="preview-eyebrow">
                  YOUR WEBSITE
                </span>

                {formData.image && (
                  <img
                    className="preview-featured-image"
                    src={formData.image}
                    alt={formData.heading || formData.title}
                  />
                )}

                <h1>
                  {formData.heading ||
                    "Your heading will appear here"}
                </h1>

                <p>
                  {formData.description ||
                    "Your description will appear here."}
                </p>

                <button
                  type="button"
                  className="preview-button"
                >
                  Learn More →
                </button>
              </section>

              <footer className="preview-footer">
                © 2026 {formData.title || "Your Website"}
              </footer>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderMediaLibrary() {
    return (
      <section className="pages-section">
        <div className="section-heading">
          <div>
            <h2>Media Library</h2>
            <p>Upload and manage your website images.</p>
          </div>

          <label className="primary-button upload-button">
            + Upload Images
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleImageUpload}
            />
          </label>
        </div>

        <div className="media-info">
          <span>
            {mediaFiles.length} image
            {mediaFiles.length !== 1 ? "s" : ""}
          </span>

          <span>Maximum 5 MB per image</span>
        </div>

        {uploadError && (
          <p className="upload-error" role="alert">
            {uploadError}
          </p>
        )}

        {mediaFiles.length === 0 ? (
          <div className="media-empty">
            <div className="media-empty-icon">▧</div>
            <h3>Your media library is empty</h3>
            <p>
              Upload images from your computer to get started.
            </p>
          </div>
        ) : (
          <div className="media-grid">
            {mediaFiles.map((file) => (
              <div className="media-card" key={file.id}>
                <div className="media-image">
                  <img src={file.url} alt={file.name} />
                </div>

                <div className="media-card-info">
                  <p title={file.name}>{file.name}</p>

                  <span>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>

                  <button
                    className="delete-button"
                    onClick={() => deleteImage(file.id)}
                  >
                    Delete image
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderOtherView() {
    return (
      <section className="pages-section">
        <div className="section-heading">
          <div>
            <h2>{activeView}</h2>
            <p>This section will be implemented next.</p>
          </div>
        </div>
      </section>
    );
  }

  const pageTitle =
    activeView === "Editor" ? "Page Editor" : activeView;

  return (
    <div className="app">
      {renderSidebar()}

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Workspace / {pageTitle}
            </p>
            <h1>{pageTitle}</h1>
          </div>

          <button className="profile-button">AA</button>
        </header>

        {activeView === "Overview" && renderOverview()}
        {activeView === "Pages" && renderPages()}
        {activeView === "Editor" && renderEditor()}
        {activeView === "Media Library" && renderMediaLibrary()}
        {activeView === "Settings" && renderOtherView()}
      </main>
    </div>
  );
}

export default App;
