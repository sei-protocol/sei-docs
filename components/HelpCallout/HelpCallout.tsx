import { Callout } from "nextra-theme-docs";

function HelpCallout() {
  return (
    <div className="my-4">
      <Callout type="info">
        <p>
          If you encounter a bug while using the devnet, please submit it via
          the form{" "}
          <a
            className="nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]"
            href="https://forms.gle/Jn2uMNeM7zEnxAL46"
            target="_blank"
            rel="noopener"
          >
            here
          </a>
          .
        </p>
      </Callout>
    </div>
  );
}

export default HelpCallout;
