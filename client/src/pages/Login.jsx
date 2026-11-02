import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useApp } from "../AuthContext";
import api, { errMsg } from "../api/client";

const Login = () => {
  const { authenticate } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      
      authenticate(data);
      navigate("/");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: 420 }}>
      <Card body>
        <h3 className="mb-3 text-center">Login</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required />
          </Form.Group>
          <Button type="submit" variant="success" className="w-100" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Form>
        <p className="mt-3 mb-0 text-center">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </Card>
    </Container>
  );
};

export default Login;
