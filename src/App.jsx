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
  },
  {
    id: 2,
    title: "About Us",
    slug: "/about",
    status: "Published",
    heading: "About Our Company",
    description: "Learn more about our company and our mission.",
  },
  {
    id: 3,
    title: "Our Services",
    slug: "/services",
    status: "Draft",
    heading: "Our Services",
    description: "Explore the services we offer.",
  },
];

function App() {
  const [pages, setPages] = useState(initialPages);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [formData, setFormData] = useState(null);

  const [activeView, setActiveView] = useState("Overview");

  const selectedPage = pages.find(
    (page) => page.id === selectedPageId
  );

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

  const publishedCount = pages.filter(
    (page) => page.status === "Published"
  ).length;

  const draftCount = pages.filter(
    (page) => page.status === "Draft"
  ).length;

  function renderSidebar() {
    return (
      <aside className="sidebar">
        <h2 className="logo">
          ContentFlow<span>.</span>
        </h2>

        <p className="menu-label">WORKSPACE</p>

        <nav>
          {["Overview", "Pages", "Media Library", "Settings"].map(
            (item) => (
              <button
                key={item}
                className={`nav-link ${activeView === item ? "active" : ""
                  }`}
                onClick={() => setActiveView(item)}
              >
                <span>
                  {{
                    Overview: "▦",
                    Pages: "▤",
                    "Media Library": "▧",
                    Settings: "⚙",
                  }[item]}
                </span>

                {item}
              </button>
            )
          )}
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
          <button className="primary-button" onClick={createPage}>
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
                    className={`status ${page.status === "Published"
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

          <button className="primary-button" onClick={createPage}>
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
            <h2>0</h2>
            <span>Images and assets</span>
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

          <button className="primary-button" onClick={createPage}>
            + Create page
          </button>
        </div>

        {renderPageTable(pages)}
      </section>
    );
  }

  function renderEditor() {
    if (!formData) return null;

    return (
      <section className="pages-section">
        <div className="section-heading">
          <div>
            <h2>Edit Page</h2>
            <p>Update your page content.</p>
          </div>

          <button
            className="secondary-button"
            onClick={() => setActiveView("Pages")}
          >
            ← Back to pages
          </button>
        </div>

        <form className="editor-form" onSubmit={savePage}>
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

            <button type="submit" className="primary-button">
              Save changes
            </button>
          </div>
        </form>
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

        {!["Overview", "Pages", "Editor"].includes(activeView) &&
          renderOtherView()}
      </main>
    </div>
  );
}

export default App;