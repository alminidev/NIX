import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readPasswordForm, readProfileForm } from "../src/lib/profile-input";

const currentEmail = "admin@admin.com";

function profileForm(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const values: Record<string, string> = {
    name: "Administrador",
    email: "Admin@Admin.com",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function passwordForm(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const values: Record<string, string> = {
    currentPassword: "senha-atual",
    newPassword: "senha-nova-1",
    confirmPassword: "senha-nova-1",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("readProfileForm", () => {
  it("normaliza o e-mail e não lê imagem", () => {
    const parsed = readProfileForm(profileForm({ image: "/images/logo-nix.png" }), currentEmail);

    assert.deepEqual(parsed.fieldErrors, {});
    assert.deepEqual(parsed.input, {
      name: "Administrador",
      email: "admin@admin.com",
      currentPassword: null,
    });
    assert.equal(parsed.input !== null && "image" in parsed.input, false);
  });

  it("não exige senha quando só o nome muda", () => {
    const parsed = readProfileForm(
      profileForm({ name: "Outro nome", currentPassword: "segredo" }),
      "Admin@Admin.com",
    );

    assert.deepEqual(parsed.fieldErrors, {});
    assert.equal(parsed.input?.name, "Outro nome");
    assert.equal(parsed.input?.currentPassword, null);
    assert.equal(JSON.stringify(parsed).includes("segredo"), false);
  });

  it("exige a senha atual para trocar o e-mail e não a devolve no erro", () => {
    const secret = "senha-atual";
    const missing = readProfileForm(
      profileForm({ email: "novo@exemplo.com" }),
      currentEmail,
    );

    assert.equal(missing.input, null);
    assert.equal(missing.fieldErrors.currentPassword, "Informe a senha atual.");

    const parsed = readProfileForm(
      profileForm({ email: "novo@exemplo.com", currentPassword: secret }),
      currentEmail,
    );

    assert.deepEqual(parsed.fieldErrors, {});
    assert.equal(parsed.input?.email, "novo@exemplo.com");
    assert.equal(parsed.input?.currentPassword, secret);

    const tooLong = "x".repeat(129);
    const rejected = readProfileForm(
      profileForm({ email: "novo@exemplo.com", currentPassword: tooLong }),
      currentEmail,
    );

    assert.equal(rejected.input, null);
    assert.equal(
      rejected.fieldErrors.currentPassword,
      "A senha atual pode ter no máximo 128 caracteres.",
    );
    assert.equal(JSON.stringify(rejected).includes(tooLong), false);
    assert.equal(JSON.stringify(rejected.fieldErrors).includes(secret), false);
  });

  it("recusa nome curto e e-mail inválido", () => {
    const { input, fieldErrors } = readProfileForm(
      profileForm({ name: "A", email: "sem-arroba" }),
      currentEmail,
    );

    assert.equal(input, null);
    assert.equal(fieldErrors.name, "Informe o nome.");
    assert.equal(fieldErrors.email, "Informe um e-mail válido.");
  });
});

describe("readPasswordForm", () => {
  it("aceita senha atual, nova senha e confirmação iguais", () => {
    const parsed = readPasswordForm(passwordForm());

    assert.deepEqual(parsed.fieldErrors, {});
    assert.deepEqual(parsed.input, {
      currentPassword: "senha-atual",
      newPassword: "senha-nova-1",
    });
  });

  it("recusa senha atual vazia, nova senha curta e confirmação diferente", () => {
    const secret = "curta";
    const { input, fieldErrors } = readPasswordForm(
      passwordForm({
        currentPassword: "",
        newPassword: secret,
        confirmPassword: "outra-senha",
      }),
    );

    assert.equal(input, null);
    assert.equal(fieldErrors.currentPassword, "Informe a senha atual.");
    assert.equal(
      fieldErrors.newPassword,
      "A nova senha precisa ter pelo menos 8 caracteres.",
    );
    assert.equal(
      fieldErrors.confirmPassword,
      "A confirmação não confere com a nova senha.",
    );
    assert.equal(JSON.stringify(fieldErrors).includes(secret), false);
  });

  it("recusa repetir a senha atual", () => {
    const { input, fieldErrors } = readPasswordForm(
      passwordForm({
        currentPassword: "senha-nova-1",
        newPassword: "senha-nova-1",
        confirmPassword: "senha-nova-1",
      }),
    );

    assert.equal(input, null);
    assert.equal(
      fieldErrors.newPassword,
      "A nova senha precisa ser diferente da atual.",
    );
  });

  it("preserva espaços na senha", () => {
    const parsed = readPasswordForm(
      passwordForm({
        currentPassword: "  atual  ",
        newPassword: "  nova senha  ",
        confirmPassword: "  nova senha  ",
      }),
    );

    assert.equal(parsed.input?.currentPassword, "  atual  ");
    assert.equal(parsed.input?.newPassword, "  nova senha  ");
  });
});
