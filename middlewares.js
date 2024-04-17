// middlewares.mjs
export const logMiddleware = async (ctx, next) => {
  // Check if ctx.message is defined before accessing its properties
  const messageText = ctx.message ? ctx.message.text : 'No text available';
  console.log(`Received message: ${messageText}`);
  await next();
};
