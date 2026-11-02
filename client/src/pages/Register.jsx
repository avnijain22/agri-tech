import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useApp } from "../AuthContext";
import api, { errMsg } from "../api/client";

const Register = () => {
  const { authenticate } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
authenticate(data);
navigate("/");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: 460 }}>
      <Card body>
        <h3 className="mb-3 text-center">Create Account</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Full name</Form.Label>
            <Form.Control name="name" value={form.name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control name="phone" value={form.phone} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control name="address" value={form.address} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password (min 6 characters)</Form.Label>
            <Form.Control type="password" name="password" minLength={6} value={form.password} onChange={handleChange} required />
          </Form.Group>
          <Button type="submit" variant="success" className="w-100" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </Button>
        </Form>
        <p className="mt-3 mb-0 text-center">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </Card>
    </Container>
  );
};

export default Register;
