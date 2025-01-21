# events
from django.db import models
from django.contrib.auth.models import User

class Event(models.Model):
    nombre = models.CharField(max_length=200)
    fecha = models.DateField()
    hora = models.TimeField()
    lugar = models.CharField(max_length=200)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    seats = models.CharField(max_length=200)  # guardamos una lista de asientos en un string, ej: "A1,A2,A3"
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reserva de {self.user.username} para {self.event.nombre}"
