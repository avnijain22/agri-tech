
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
import api, { getErrorMessage } from "../api/axios";

const STAGES = ["sowing", "growing", "flowering", "harvesting", "harvested"];
const TYPES = ["cereal", "pulse", "vegetable", "fruit", "oilseed", "other"];

const stageColor = {
  sowing: "secondary",
  growing: "success",
  flowering: "warning",
  harvesting: "primary",
  harvested: "dark",
};

const emptyForm = {
  farm: "",
  cropName: "",
  cropType: "cereal",
  sowingTime: "",
  harvestingTime: "",
  growthStage: "sowing",
  notes: "",
};

const toDateInput = (d) => (d ? String(d).slice(0, 10) : "");
const showDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [filterFarm, setFilterFarm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try {
      const [farmRes, cropRes] = await Promise.all([
        api.get("/farms"),
        api.get("/crops", {
          params: filterFarm ? { farm: filterFarm } : {},
        }),
      ]);

      setFarms(farmRes.data);
      setCrops(cropRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filterFarm]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      farm: filterFarm || (farms[0] && farms[0]._id) || "",
    });
    setFormError("");
    setShow(true);
  };

  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({
      farm: c.farm ? c.farm._id : "",
      cropName: c.cropName,
      cropType: c.cropType || "other",
      sowingTime: toDateInput(c.sowingTime),
      harvestingTime: toDateInput(c.harvestingTime),
      growthStage: c.growthStage,
      notes: c.notes || "",
    });
    setFormError("");
    setShow(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const payload = {
      ...form,
      sowingTime: form.sowingTime || null,
      harvestingTime: form.harvestingTime || null,
    };

    try {
      if (editingId) {
        await api.put(`/crops/${editingId}`, payload);
      } else {
        await api.post("/crops", payload);
      }

      setShow(false);
      await load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete crop "${c.cropName}"?`)) return;

    try {
      await api.delete(`/crops/${c._id}`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="align-items-center mb-3 g-2">
        <Col>
          <h3 className="mb-0">My Crops</h3>
        </Col>

        <Col xs="auto">
          <Form.Select
            value={filterFarm}
            onChange={(e) => setFilterFarm(e.target.value)}
          >
            <option value="">All farms</option>
            {farms.map((f) => (
              <option key={f._id} value={f._id}>
                {f.farmName}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col xs="auto">
          <Button
            variant="success"
            onClick={openAdd}
            disabled={farms.length === 0}
          >
            + Add Crop
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {farms.length === 0 ? (
        <Alert variant="warning">
          You need a farm before adding crops.{" "}
          <Link to="/farms">Add a farm first</Link>.
        </Alert>
      ) : crops.length === 0 ? (
        <Alert variant="info">
          No crops yet. Click "Add Crop" to start tracking.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Crop</th>
              <th>Farm</th>
              <th>Type</th>
              <th>Sowing</th>
              <th>Harvest</th>
              <th>Stage</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {crops.map((c) => (
              <tr key={c._id}>
                <td>{c.cropName}</td>
                <td>{c.farm ? c.farm.farmName : "-"}</td>
                <td>{c.cropType || "-"}</td>
                <td>{showDate(c.sowingTime)}</td>
                <td>{showDate(c.harvestingTime)}</td>
                <td>
                  <Badge bg={stageColor[c.growthStage]}>
                    {c.growthStage}
                  </Badge>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => openEdit(c)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(c)}
                  >
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
            <Modal.Title>
              {editingId ? "Edit Crop" : "Add Crop"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Farm</Form.Label>
              <Form.Select
                name="farm"
                value={form.farm}
                onChange={handleChange}
                disabled={!!editingId}
                required
              >
                {farms.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.farmName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Crop name</Form.Label>
              <Form.Control
                name="cropName"
                value={form.cropName}
                onChange={handleChange}
                placeholder="e.g. Wheat"
                required
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name="cropType"
                    value={form.cropType}
                    onChange={handleChange}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Growth stage</Form.Label>
                  <Form.Select
                    name="growthStage"
                    value={form.growthStage}
                    onChange={handleChange}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Sowing date</Form.Label>
                  <Form.Control
                    type="date"
                    name="sowingTime"
                    value={form.sowingTime}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Expected harvest</Form.Label>
                  <Form.Control
                    type="date"
                    name="harvestingTime"
                    value={form.harvestingTime}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={form.notes}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShow(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="success"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Crops;
