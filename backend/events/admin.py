from django.contrib import admin
from .models import Event, Reservation

# Registra los modelos para que sean visibles en el admin
admin.site.register(Event)
admin.site.register(Reservation)