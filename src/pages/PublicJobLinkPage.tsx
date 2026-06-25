import { useEffect, useMemo } from "react";
import { Button, Card, Typography } from "antd";
import { useParams } from "@tanstack/react-router";

const { Paragraph, Title, Text } = Typography;

export default function PublicJobLinkPage() {
  const { jobId } = useParams({ strict: false });

  const appLink = useMemo(() => {
    const trimmedJobId = jobId?.trim();
    return trimmedJobId ? `doctpro://job/${trimmedJobId}` : "doctpro://home";
  }, [jobId]);

  useEffect(() => {
    const openTimer = window.setTimeout(() => {
      window.location.href = appLink;
    }, 250);

    return () => {
      window.clearTimeout(openTimer);
    };
  }, [appLink]);

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
          Open this job in Doctpro
        </Title>
        <Paragraph style={{ marginBottom: 8 }}>
          We are opening this shared job in the Doctpro mobile app.
        </Paragraph>
        {jobId ? (
          <Text type="secondary">Job ID: {jobId}</Text>
        ) : (
          <Text type="secondary">Shared job link</Text>
        )}
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              window.location.href = appLink;
            }}
          >
            Open in App
          </Button>
          <Text type="secondary">
            If the app is not installed, this link will stay in the browser.
          </Text>
        </div>
      </Card>
    </div>
  );
}
