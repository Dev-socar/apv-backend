import nodemailer from "nodemailer";

const emailOlvidePassword = async (datos) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;
  //enviar email
  const info = await transporter.sendMail({
    from: '"APV - Administrador de Pacientes de Veterinaria" <apv@correo.com>',
    to: email,
    subject: "Reestablece tu Password",
    text: "Reestablece tu Password",
    html: `<p>Hola ${nombre}, haz solicitado restablecer tu password.</p>
      <p>Sigue el siguiente enlace para generar un nuevo password: <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer password</a> </p>
      <p>Si tu no solicitaste esta accion, puedes ignorar este mensaje</p>
    `,
  });
};

export default emailOlvidePassword;
