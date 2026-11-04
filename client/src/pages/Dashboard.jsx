
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useApp } from "../AuthContext";
import api, { errMsg } from "../api/client";

const Dashboard = () => {
  const { user } = useApp();
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [f, c] = await Promise.all([
          api.get("/farms"),
          api.get("/crops"),
        ]);

        setFarms(f.data);
        setCrops(c.data);
      } catch (err) {
        setError(errMsg(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalAcres = farms.reduce(
    (sum, f) => sum + (f.farmSize || 0),
    0
  );

  const activeCrops = crops.filter(
    (c) => c.growthStage !== "harvested"
  ).length;

  // Crops (not yet harvested) due for harvest within the next 30 days
  const now = Date.now();
  const in30 = now + 30 * 24 * 60 * 60 * 1000;

  const upcoming = crops
    .filter(
      (c) => c.harvestingTime && c.growthStage !== "harvested"
    )
    .filter((c) => {
      const t = new Date(c.harvestingTime).getTime();
      return t >= now && t <= in30;
    })
    .sort(
      (a, b) =>
        new Date(a.harvestingTime) - new Date(b.harvestingTime)
    );

  const stat = (label, value) => (
    <Col md={4} className="mb-3">
      <Card body className="text-center">
        <h2 className="mb-0">{value}</h2>
        <div className="text-muted">{label}</div>
      </Card>
    </Col>
  );

  return (
    <Container className="mt-4">
      <h3 className="mb-3">Welcome, {user?.name}</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Row>
            {stat("Farms", farms.length)}
            {stat("Total acres", totalAcres)}
            {stat("Active crops", activeCrops)}
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Card>
                <Card.Header>
                  Upcoming harvests (next 30 days)
                </Card.Header>

                {upcoming.length === 0 ? (
                  <Card.Body className="text-muted">
                    Nothing due in the next 30 days.
                  </Card.Body>
                ) : (
                  <ListGroup variant="flush">
                    {upcoming.map((c) => (
                      <ListGroup.Item
                        key={c._id}
                        className="d-flex justify-content-between"
                      >
                        <span>
                          {c.cropName}{" "}
                          <small className="text-muted">
                            ({c.farm ? c.farm.farmName : "-"})
                          </small>
                        </span>

                        <span>
                          {new Date(
                            c.harvestingTime
                          ).toLocaleDateString()}
                        </span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card>
            </Col>

            <Col md={6} className="mb-3">
              <Card>
                <Card.Header>Quick actions</Card.Header>

                <Card.Body className="d-grid gap-2">
                  <Button
                    as={Link}
                    to="/farms"
                    variant="outline-success"
                  >
                    Manage farms
                  </Button>

                  <Button
                    as={Link}
                    to="/crops"
                    variant="outline-success"
                  >
                    Manage crops
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Dashboard;


