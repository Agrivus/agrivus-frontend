import { describe, it, expect } from "vitest";
import { getRoleLandingRoute } from "./roleLandingRoute";

describe("getRoleLandingRoute", () => {
  it("should redirect admin to /admin", () => {
    expect(getRoleLandingRoute("admin")).toBe("/admin");
  });

  it("should redirect support_moderator to /moderator", () => {
    expect(getRoleLandingRoute("support_moderator")).toBe("/moderator");
  });

  it("should redirect accounts_officer to /accounts", () => {
    expect(getRoleLandingRoute("accounts_officer")).toBe("/accounts");
  });

  it("should redirect farmer to /dashboard", () => {
    expect(getRoleLandingRoute("farmer")).toBe("/dashboard");
  });

  it("should redirect buyer to /dashboard", () => {
    expect(getRoleLandingRoute("buyer")).toBe("/dashboard");
  });

  it("should redirect transporter to /dashboard", () => {
    expect(getRoleLandingRoute("transporter")).toBe("/dashboard");
  });

  it("should redirect agro_supplier to /dashboard", () => {
    expect(getRoleLandingRoute("agro_supplier")).toBe("/dashboard");
  });

  it("should redirect vendor to /dashboard", () => {
    expect(getRoleLandingRoute("vendor")).toBe("/dashboard");
  });

  it("should redirect undefined to /dashboard", () => {
    expect(getRoleLandingRoute(undefined)).toBe("/dashboard");
  });

  it("should redirect null to /dashboard", () => {
    expect(getRoleLandingRoute(null as any)).toBe("/dashboard");
  });

  it("should redirect empty string to /dashboard", () => {
    expect(getRoleLandingRoute("")).toBe("/dashboard");
  });

  it("should redirect unknown role to /dashboard", () => {
    expect(getRoleLandingRoute("unknown_role")).toBe("/dashboard");
  });
});
