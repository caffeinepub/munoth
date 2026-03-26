export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);
  return (
    <footer className="text-center py-8 text-sm text-muted-foreground border-t border-border mt-12">
      © {year}. Built with ❤️ using{" "}
      <a
        href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        caffeine.ai
      </a>
    </footer>
  );
}
