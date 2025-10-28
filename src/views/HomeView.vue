<template>
  <v-app>
    <!-- Navegación lateral -->
    <v-navigation-drawer app color="#f8f8d8" width="220">
      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon color="primary">mdi-store</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold">Nombre mamalon</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"/>
        <v-list-item link>
          <v-icon left>mdi-view-dashboard</v-icon>
          Dashboard
        </v-list-item>
        <v-list-item link>
          <v-icon left>mdi-account-group</v-icon>
          Usuarios
        </v-list-item>
        <v-list-item link>
          <v-icon left>mdi-package-variant</v-icon>
          Productos
        </v-list-item>
        <v-list-item link to="/inventory">
          <v-icon left>mdi-warehouse</v-icon>
          Inventario
        </v-list-item>
        <v-list-item link>
          <v-icon left>mdi-swap-horizontal</v-icon>
          Transacciones
        </v-list-item>
        <v-list-item link>
          <v-icon left>mdi-chart-bar</v-icon>
          Reportes
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Contenido principal -->
    <v-main>
      <!-- Encabezado -->
      <v-app-bar color="white" elevation="1">
        <v-toolbar-title>
          Bienvenido, <span class="font-weight-bold">Admin</span>
        </v-toolbar-title>
        <v-spacer />
        <v-chip color="primary" text-color="white" class="ml-2">Admin</v-chip>
      </v-app-bar>

      <v-container fluid>
        <!-- Tarjetas resumen -->
        <v-row class="mt-6" justify="center">
          <v-col cols="12" md="4">
            <v-card class="pa-4" outlined>
              <v-row align="center">
                <v-icon color="primary" size="36">mdi-package-variant</v-icon>
                <div class="ml-4">
                  <div class="text-h6 font-weight-bold">Total de productos</div>
                  <div class="text-h5">120</div>
                </div>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="pa-4" outlined>
              <v-row align="center">
                <v-icon color="primary" size="36">mdi-store</v-icon>
                <div class="ml-4">
                  <div class="text-h6 font-weight-bold">Total de tiendas</div>
                  <div class="text-h5">5</div>
                </div>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="pa-4" outlined>
              <v-row align="center">
                <v-icon color="red" size="36">mdi-alert</v-icon>
                <div class="ml-4">
                  <div class="text-h6 font-weight-bold">Alertas de bajo stock</div>
                  <div class="text-h5" style="color: red;">8</div>
                </div>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Sección de gráficas -->
        <v-row class="mt-8" justify="center">
          <v-col cols="12" md="6">
            <v-card class="pa-4" outlined>
              <div class="text-h6 font-weight-bold mb-2">Tendencias de ventas</div>
              <!-- Aquí iría el componente de gráfica -->
              <div class="grey--text text--lighten-1">[Gráfica de ventas]</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="pa-4" outlined>
              <div class="text-h6 font-weight-bold mb-2">Productos más vendidos</div>
              <!-- Aquí iría el componente de gráfica -->
              <div class="grey--text text--lighten-1">[Gráfica de productos vendidos]</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="pa-4 mt-6" outlined>
              <div class="text-h6 font-weight-bold mb-2">Valor de inventario por tienda</div>
              <!-- Aquí iría el componente de gráfica -->
              <div class="grey--text text--lighten-1">[Gráfica de inventario por tienda]</div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
// Aquí puedes agregar lógica y datos
</script>