
import { Container, Card } from "react-bootstrap";
import { useApp } from "../AuthContext";

const Dashboard = () => {
  const { user } = useApp();

  return (
    <Container className="mt-4">
      <Card body>
        <h3>Welcome, {user.name}</h3>

        <p className="mb-0">
          You are logged in as <strong>{user.role}</strong>. Farm, crop, weather
          and shop sections will appear here as we build them.
        </p>
      </Card>
    </Container>
  );
};

export default Dashboard;

