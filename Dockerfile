# =========================================
# Stage 1: Build the React (Vite) Application
# =========================================
 
ARG NODE_VERSION=24.14.0-alpine

# Use a lightweight Node.js image for building (customizable via ARG)
FROM node:${NODE_VERSION} AS builder


# Enable corepack so the pnpm version pinned for this repo is available
RUN corepack enable


# Set the working directory inside the container
WORKDIR /app


# Copy the full workspace source (pnpm needs every workspace member's
# package.json present to resolve the workspace graph correctly)
COPY . .


# Install project dependencies using a frozen lockfile (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

# Build the React.js application (outputs to /app/dist)
RUN pnpm run build
 
 
# =========================================
# Stage 2: Serve static files with Node.js + `serve`
# =========================================
FROM node:${NODE_VERSION} AS runner


# Enable corepack so pnpm is available for the `serve` install below
RUN corepack enable


# Set the environment to production for smaller + optimized installs
ENV NODE_ENV=production


# Set the working directory inside the container
WORKDIR /app


# Copy only the production build output from the builder stage
COPY --link --from=builder /app/src/apps/client/dist ./dist


# Install only the `serve` package (no global install, pinned version)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install serve@^14.2.6 --prod


# Run the container as a non-root user for security best practices
USER node


# Expose port 3000 (the same port configured in "serve -l 3000")
EXPOSE 3000


# Run `serve` directly to serve the built app
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]