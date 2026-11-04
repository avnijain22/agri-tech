
import { useCallback, useEffect, useState } from "react";
import { Container, Table, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import api, { getErrorMessage } from "../api/axios";

const emptyForm = { farmName: "", farmSize: "", location: "", soilType: "" };

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadFarms = useCallback(async () => {
    try {
      const { data } = await api.get("/farms");
      setFarms(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShow(true);
  };

  const openEdit = (farm) => {
    setEditingId(farm._id);
    setForm({
      farmName: farm.farmName,
      farmSize: farm.farmSize,
      location: farm.location,
      soilType: farm.soilType || "",
    });
    setFormError("");
    setShow(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editingId) await api.put(`/farms/${editingId}`, form);
      else await api.post("/farms", form);
      setShow(false);
      await loadFarms();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (farm) => {
    if (!window.confirm(`Delete "${farm.farmName}" and all its crops?`)) return;
    try {
      await api.delete(`/farms/${farm._id}`);
      await loadFarms();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">My Farms</h3>
        <Button variant="success" onClick={openAdd}>+ Add Farm</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Spinner animation="border" />
      ) : farms.length === 0 ? (
        <Alert variant="info">No farms yet. Click "Add Farm" to create your first one.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size (acres)</th>
              <th>Location</th>
              <th>Soil type</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {farms.map((f) => (
              <tr key={f._id}>
                <td>{f.farmName}</td>
                <td>{f.farmSize}</td>
                <td>{f.location}</td>
                <td>{f.soilType || "-"}</td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(f)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(f)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={show} onHide={() => setShow(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? "Edit Farm" : "Add Farm"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Farm name</Form.Label>
              <Form.Control name="farmName" value={form.farmName} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Size (acres)</Form.Label>
              <Form.Control type="number" min="0" step="0.1" name="farmSize" value={form.farmSize} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location (city or district)</Form.Label>
              <Form.Control name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bhopal" required />
              <Form.Text muted>This city is used to fetch weather for the farm.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Soil type</Form.Label>
              <Form.Control name="soilType" value={form.soilType} onChange={handleChange} placeholder="e.g. Black soil" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
            <Button type="submit" variant="success" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Farms;
