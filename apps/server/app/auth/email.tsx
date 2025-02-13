/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CSSProperties } from "react";
import { renderToString } from "react-dom/server";
import { Resend } from "resend";

const COLOR_NEUTRAL_50 = "#fafafa";
const COLOR_NEUTRAL_100 = "#f5f5f5";
const COLOR_NEUTRAL_200 = "#e5e5e5";
const COLOR_NEUTRAL_300 = "#d4d4d4";
const COLOR_NEUTRAL_400 = "#a3a3a3";
const COLOR_NEUTRAL_500 = "#737373";
const COLOR_NEUTRAL_600 = "#525252";
const COLOR_NEUTRAL_700 = "#404040";
const COLOR_NEUTRAL_800 = "#262626";
const COLOR_NEUTRAL_900 = "#171717";
const COLOR_NEUTRAL_950 = "#0a0a0a";

const EmailWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <table
      style={
        {
          color: COLOR_NEUTRAL_50,
          width: "100%",
          maxWidth: "600px",
          background: COLOR_NEUTRAL_950,
        } as CSSProperties
      }
    >
      <tbody>
        <tr>
          <td style={{ padding: "16px" }}>
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "0 16px", textAlign: "right" }}>
                    <h1
                      style={{
                        color: COLOR_NEUTRAL_50,
                        fontSize: "24px",
                        fontWeight: "900",
                        border: `1px solid ${COLOR_NEUTRAL_800}`,
                        borderRadius: "6px",
                        padding: "8px 16px",
                      }}
                    >
                      TYL
                    </h1>
                  </td>
                </tr>
              </tbody>
            </table>
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "8px 16px" }}>{children}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const EmailButton = ({
  children,
  href,
  style,
}: {
  children: React.ReactNode;
  href: string;
  style?: CSSProperties;
}) => {
  return (
    <table style={{ width: "100%" }}>
      <tbody>
        <tr>
          <td>
            <a
              href={href}
              target="_blank"
              style={{
                color: COLOR_NEUTRAL_950,
                background: COLOR_NEUTRAL_50,
                fontWeight: "semibold",
                display: "block",
                padding: "8px 16px",
                borderRadius: "6px",
                textAlign: "center",
                textDecoration: "none",
                ...style,
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export const VerificationEmailTemplate = ({
  url,
  emailChange,
}: {
  url: string;
  emailChange?: string;
}) => {
  return (
    <EmailWrapper>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
        Email verification
      </h1>
      <p style={{ marginTop: "8px" }}>Click below to verify your email</p>

      <EmailButton href={url} style={{ marginTop: "16px" }}>
        Verify email
      </EmailButton>
    </EmailWrapper>
  );
};

export const ChangeEmailVerificationEmailTemplate = ({
  url,
  newEmail,
}: {
  url: string;
  newEmail: string;
}) => {
  return (
    <EmailWrapper>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
        Confirm email change
      </h1>
      <p style={{ marginTop: "8px" }}>
        Click below to change your email to{" "}
        <b style={{ color: COLOR_NEUTRAL_50, textDecoration: "none" }}>
          {newEmail}
        </b>
      </p>

      <EmailButton href={url} style={{ marginTop: "16px" }}>
        Configrm change
      </EmailButton>
    </EmailWrapper>
  );
};

export const ResetPasswordEmailTemplate = ({ url }: { url: string }) => {
  return (
    <EmailWrapper>
      <p>Click below to reset your password:</p>

      <EmailButton href={url} style={{ marginTop: "8px" }}>
        Reset password
      </EmailButton>
    </EmailWrapper>
  );
};

export const sendVerificationEmail = async (to: string, url: string) => {
  const html = renderToString(<VerificationEmailTemplate url={url} />);

  await sendEmail(to, "TYL — Verify your email", html);
};

export const sendChangeVerificationEmail = async (
  to: string,
  url: string,
  newEmail: string,
) => {
  const html = renderToString(
    <VerificationEmailTemplate url={url} emailChange={newEmail} />,
  );

  await sendEmail(to, "TYL — Verify your new email", html);
};

export const sendResetPasswordEmail = async (to: string, url: string) => {
  const html = renderToString(<ResetPasswordEmailTemplate url={url} />);

  await sendEmail(to, "TYL — Reset your password", html);
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const r = await resend.emails.send({
    from: `TrackYourLife Auth <${process.env.RESEND_FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
};
