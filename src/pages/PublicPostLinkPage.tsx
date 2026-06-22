import { Button, Card, Typography } from "antd";
import { useNavigate, useParams } from "@tanstack/react-router";

const { Paragraph, Title, Text } = Typography;

export default function PublicPostLinkPage() {
  const navigate = useNavigate();
  const { postId } = useParams({ strict: false });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "linear-gradient(180deg, rgba(242,248,255,1) 0%, rgba(255,255,255,1) 100%)",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 20,
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Title level={3} style={{ marginBottom: 12 }}>
          Open this post in Doctpro
        </Title>
        <Paragraph style={{ marginBottom: 8 }}>
          This shared post is available in the Doctpro mobile app for signed-in
          users.
        </Paragraph>
        {postId ? (
          <Text type="secondary">Post ID: {postId}</Text>
        ) : (
          <Text type="secondary">Shared post link</Text>
        )}
        <div style={{ marginTop: 24 }}>
          <Button type="primary" size="large" onClick={() => navigate({ to: "/auth/login" })}>
            Continue to Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
