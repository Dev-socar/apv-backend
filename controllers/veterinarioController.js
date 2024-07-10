import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {
  const { email, nombre } = req.body;

  //prevenir usuarios duplicados
  const existeUsuario = await Veterinario.findOne({ email });
  if (existeUsuario) {
    const error = new Error("Usuario Ya Registrado");
    return res.status(400).json({ msg: error.message });
  }

  try {
    //guardar un nuevo veterinario
    const veterinario = new Veterinario(req.body);
    const veterinarioGuardado = await veterinario.save();

    //enviar el email de confirmacion
    emailRegistro({
      email,
      nombre,
      token: veterinarioGuardado.token,
    });

    res.json(veterinarioGuardado);
  } catch (error) {
    console.log(error);
  }
};

const perfil = (req, res) => {
  const { veterinario } = req;
  res.json(veterinario);
};

const confirmar = async (req, res) => {
  //obtenemos el token de la url
  const { token } = req.params;

  //buscamos el veterinario con ese token
  const usuarioConfirmar = await Veterinario.findOne({ token });

  //Si no se encuentra al veterinario
  if (!usuarioConfirmar) {
    const error = new Error("Token No Valido");
    return res.status(404).json({ msg: error.message });
  }

  //si existe un vet con ese Token
  try {
    //reseteamos el token y cambiamos el valor de confirmado
    usuarioConfirmar.token = null;
    usuarioConfirmar.confirmado = true;

    //guardamos los cambios
    await usuarioConfirmar.save();
    res.json({ msg: "Usuario Confirmado Correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;
  //comprobar si el usr existe
  const usuario = await Veterinario.findOne({ email });
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }

  //comprobar si el usr esta confirmado
  if (!usuario.confirmado) {
    const error = new Error("Tu cuenta no ha sido confirmada");
    return res.status(403).json({ msg: error.message });
  }

  //Comprobar el password
  if (await usuario.comprobarPassword(password)) {
    //Autenticar usr con JWT
    res.json({ 
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      web: usuario.web,
      telefono: usuario.telefono,
      token: generarJWT(usuario.id),
    });
  } else {
    const error = new Error("El password es incorrecto");
    return res.status(403).json({ msg: error.message });
  }
};

const olvidePassword = async (req, res) => {
  const { email } = req.body;
  const existeVet = await Veterinario.findOne({ email });
  if (!existeVet) {
    const error = new Error("El usuario no existe");
    return res.status(400).json({ msg: error.message });
  }

  try {
    existeVet.token = generarId();
    await existeVet.save();

    //Enviar email con instrucciones
    emailOlvidePassword({
      email,
      nombre: existeVet.nombre,
      token: existeVet.token,
    });
    res.json({ msg: "Hemos enviado un email con las instrucciones" });
  } catch (error) {
    console.log(error);
  }
};
const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const existeToken = await Veterinario.findOne({ token });
  if (existeToken) {
    res.json({ msg: "Token Valido y el usuario existe" });
  } else {
    const error = new Error("El Token no es Valido");
    return res.status(400).json({ msg: error.message });
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const veterinario = await Veterinario.findOne({ token });

  if (!veterinario) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }

  try {
    veterinario.token = null;
    veterinario.password = password;
    await veterinario.save();
    res.json({ msg: "Password Modificado Correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const actualizarPerfil = async (req, res) => {
  const veterinario = await Veterinario.findById(req.params.id);
  if (!veterinario) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }
  const { email } = req.body;
  if (veterinario.email !== req.body.email) {
    const existeEmail = await Veterinario.findOne({ email });
    if (existeEmail) {
      const error = new Error("Ese email ya esta en uso");
      return res.status(400).json({ msg: error.message });
    }
  }

  try {
    veterinario.nombre = req.body.nombre;
    veterinario.email = req.body.email;
    veterinario.web = req.body.web;
    veterinario.telefono = req.body.telefono;

    const veterinarioActualizado = await veterinario.save();
    res.json(veterinarioActualizado);
  } catch (error) {
    console.log(error);
  }
};

const actualizarPassword = async (req, res) => {
  //Leer los datos
  const { id } = req.veterinario;
  const { pwd_actual, pwd_nuevo } = req.body;

  //Comprobar si el veterinario existe
  const veterinario = await Veterinario.findById(id);
  if (!veterinario) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }

  //Comprobar su password
  if (await veterinario.comprobarPassword(pwd_actual)) {
    //Almacenar nuevo password
    veterinario.password = pwd_nuevo;
    await veterinario.save();
    res.json({ msg: "Password Cambiado Correctamente" });
  } else {
    const error = new Error("El password Actual es Incorrecto");
    return res.status(400).json({ msg: error.message });
  }
};

export {
  registrar,
  perfil,
  confirmar,
  autenticar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  actualizarPerfil,
  actualizarPassword,
};
